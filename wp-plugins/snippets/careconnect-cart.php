<?php
/**
 * Snippet: careconnect-cart
 * Run on: Frontend + Admin (Run snippet everywhere)
 *
 * Headless wrapper around the REAL WooCommerce cart/session.
 * Endpoints keep the React contract stable, but every mutation goes through
 * WC()->cart so WooCommerce Bookings, Dokan, taxes, coupons, fees, stock,
 * validation, and cart item hooks all run normally.
 *
 * Endpoints (all require is_user_logged_in via JWT):
 *   GET    /wp-json/careconnect/v1/cart
 *   POST   /wp-json/careconnect/v1/cart/items          — { product_id, quantity?, booking?, price_override? }
 *   DELETE /wp-json/careconnect/v1/cart/items/{key}
 *   DELETE /wp-json/careconnect/v1/cart
 */

add_action('rest_api_init', function () {
    $auth = function () { return is_user_logged_in(); };

    register_rest_route('careconnect/v1', '/cart', array(
        array('methods' => 'GET',    'permission_callback' => $auth, 'callback' => 'cc_cart_get'),
        array('methods' => 'DELETE', 'permission_callback' => $auth, 'callback' => 'cc_cart_clear'),
    ));
    register_rest_route('careconnect/v1', '/cart/items', array(
        'methods'             => 'POST',
        'permission_callback' => $auth,
        'callback'            => 'cc_cart_add_item',
    ));
    register_rest_route('careconnect/v1', '/cart/items/(?P<key>[A-Za-z0-9_\-]+)', array(
        'methods'             => 'DELETE',
        'permission_callback' => $auth,
        'callback'            => 'cc_cart_remove_item',
    ));
});

function cc_native_wc_load_cart() {
    if (!function_exists('WC')) {
        return new WP_Error('wc_missing', 'WooCommerce not active', array('status' => 500));
    }

    if (function_exists('wc_load_cart')) {
        wc_load_cart();
    } else {
        if (defined('WC_ABSPATH')) {
            include_once WC_ABSPATH . 'includes/wc-cart-functions.php';
            include_once WC_ABSPATH . 'includes/class-wc-cart.php';
        }
        if (method_exists(WC(), 'initialize_session') && null === WC()->session) {
            WC()->initialize_session();
        }
        if (method_exists(WC(), 'initialize_cart') && null === WC()->cart) {
            WC()->initialize_cart();
        }
    }

    if (is_user_logged_in()) {
        WC()->customer = new WC_Customer(get_current_user_id(), true);
    }

    if (!WC()->cart) {
        return new WP_Error('cart_missing', 'WooCommerce cart unavailable', array('status' => 500));
    }

    // REST calls are authenticated by JWT, not browser cookies. Force the cart
    // to use the logged-in customer's Woo session/persistent cart so this is
    // still the native Woo cart, not a separate custom user_meta cart.
    if (WC()->session && method_exists(WC()->session, 'set_customer_session_cookie')) {
        WC()->session->set_customer_session_cookie(true);
    }
    if (method_exists(WC()->cart, 'get_cart_from_session')) {
        WC()->cart->get_cart_from_session();
    }

    return true;
}

function cc_native_wc_persist_cart() {
    if (!WC()->cart) return;
    WC()->cart->calculate_totals();
    if (method_exists(WC()->cart, 'set_session')) {
        WC()->cart->set_session();
    }
    if (method_exists(WC()->cart, 'persistent_cart_update')) {
        WC()->cart->persistent_cart_update();
    }
    if (WC()->session && method_exists(WC()->session, 'set_customer_session_cookie')) {
        WC()->session->set_customer_session_cookie(true);
    }
}

function cc_cart_minor($amount) {
    $decimals = function_exists('wc_get_price_decimals') ? wc_get_price_decimals() : 2;
    return (string) ((int) round(((float) $amount) * pow(10, $decimals)));
}

function cc_cart_format_item($key, $it) {
    $product = isset($it['data']) && is_object($it['data']) ? $it['data'] : wc_get_product($it['product_id'] ?? 0);
    $currency = function_exists('get_woocommerce_currency') ? get_woocommerce_currency() : 'USD';
    $symbol = function_exists('get_woocommerce_currency_symbol') ? get_woocommerce_currency_symbol($currency) : '$';
    $decimals = function_exists('wc_get_price_decimals') ? wc_get_price_decimals() : 2;
    $image_url = '';
    if ($product && $product->get_image_id()) $image_url = wp_get_attachment_url($product->get_image_id());

    $line_total = isset($it['line_total']) ? (float) $it['line_total'] : 0.0;
    $unit_price = $product ? (float) $product->get_price() : 0.0;

    $out = array(
        'key'      => $key,
        'id'       => (int) ($it['product_id'] ?? 0),
        'product_id' => (int) ($it['product_id'] ?? 0),
        'name'     => $product ? $product->get_name() : '',
        'quantity' => (int) ($it['quantity'] ?? 1),
        'prices'   => array('price' => cc_cart_minor($unit_price), 'currency_code' => $currency, 'currency_minor_unit' => $decimals, 'currency_symbol' => $symbol),
        'images'   => $image_url ? array(array('src' => $image_url)) : array(),
        'totals'   => array('line_total' => cc_cart_minor($line_total), 'currency_code' => $currency, 'currency_minor_unit' => $decimals, 'currency_symbol' => $symbol),
    );

    if (!empty($it['booking']) && is_array($it['booking'])) $out['booking'] = $it['booking'];
    if (!empty($it['cc_service_type'])) $out['service_type'] = $it['cc_service_type'];
    if (!empty($it['cc_customer_note'])) $out['customer_note'] = $it['cc_customer_note'];
    return $out;
}

function cc_cart_response() {
    $loaded = cc_native_wc_load_cart();
    if (is_wp_error($loaded)) return $loaded;
    WC()->cart->calculate_totals();

    $items = array();
    foreach (WC()->cart->get_cart() as $key => $it) {
        $items[] = cc_cart_format_item($key, $it);
    }

    $currency = function_exists('get_woocommerce_currency') ? get_woocommerce_currency() : 'USD';
    $symbol = function_exists('get_woocommerce_currency_symbol') ? get_woocommerce_currency_symbol($currency) : '$';
    $decimals = function_exists('wc_get_price_decimals') ? wc_get_price_decimals() : 2;
    $total = (float) WC()->cart->get_total('edit');
    return rest_ensure_response(array(
        'items'       => $items,
        'totals'      => array(
            'total_price' => cc_cart_minor($total),
            'total_items' => cc_cart_minor((float) WC()->cart->get_subtotal()),
            'currency_code' => $currency,
            'currency_symbol' => $symbol,
            'currency_minor_unit' => $decimals,
        ),
        'items_count' => (int) WC()->cart->get_cart_contents_count(),
    ));
}

function cc_cart_get(WP_REST_Request $req) {
    return cc_cart_response();
}

function cc_cart_clear(WP_REST_Request $req) {
    $loaded = cc_native_wc_load_cart();
    if (is_wp_error($loaded)) return $loaded;
    WC()->cart->empty_cart();
    cc_native_wc_persist_cart();
    return cc_cart_response();
}

function cc_set_booking_post_value($key, $value) {
    $_POST[$key] = $value;
    $_REQUEST[$key] = $value;
}

function cc_populate_wc_bookings_post_fields($product_id, $booking) {
    cc_set_booking_post_value('add-to-cart', (string) $product_id);
    cc_set_booking_post_value('wc_bookings_field_start_date_local_timezone', function_exists('wp_timezone_string') ? wp_timezone_string() : 'UTC');

    if (!empty($booking['startDate'])) {
        $parts = explode('-', sanitize_text_field((string) $booking['startDate']));
        if (count($parts) === 3) {
            cc_set_booking_post_value('wc_bookings_field_start_date_year', $parts[0]);
            cc_set_booking_post_value('wc_bookings_field_start_date_month', $parts[1]);
            cc_set_booking_post_value('wc_bookings_field_start_date_day', $parts[2]);
            // Back-compat aliases used by older custom code; native Bookings uses year/month/day.
            cc_set_booking_post_value('wc_bookings_field_start_date_yy', $parts[0]);
            cc_set_booking_post_value('wc_bookings_field_start_date_mm', $parts[1]);
            cc_set_booking_post_value('wc_bookings_field_start_date_dd', $parts[2]);
        }
    }
    if (!empty($booking['startTime'])) {
        cc_set_booking_post_value('wc_bookings_field_start_date_time', sanitize_text_field((string) $booking['startTime']));
    }
    if (!empty($booking['durationHours'])) {
        cc_set_booking_post_value('wc_bookings_field_duration', (string) max(1, (int) $booking['durationHours']));
    }
    if (!empty($booking['resourceId'])) {
        cc_set_booking_post_value('wc_bookings_field_resource', (string) absint($booking['resourceId']));
    }
    if (!empty($booking['persons']) && is_array($booking['persons'])) {
        foreach ($booking['persons'] as $person_id => $count) {
            cc_set_booking_post_value('wc_bookings_field_persons_' . absint($person_id), (string) max(0, (int) $count));
        }
    }
}

function cc_cart_add_item(WP_REST_Request $req) {
    $loaded = cc_native_wc_load_cart();
    if (is_wp_error($loaded)) return $loaded;

    $params     = $req->get_json_params();
    $product_id = isset($params['product_id']) ? absint($params['product_id']) : 0;
    $quantity   = isset($params['quantity']) ? max(1, absint($params['quantity'])) : 1;
    $booking    = isset($params['booking']) && is_array($params['booking']) ? $params['booking'] : null;
    $price_over = isset($params['price_override']) ? (float) $params['price_override'] : null;

    if ($product_id <= 0) return new WP_Error('bad_product', 'product_id required', array('status' => 400));
    $product = wc_get_product($product_id);
    if (!$product) return new WP_Error('not_found', 'Product not found', array('status' => 404));
    if (!$product->is_purchasable()) return new WP_Error('not_purchasable', 'Product is not purchasable', array('status' => 400));
    if ($product->is_type('booking') && empty($booking)) {
        return new WP_Error('booking_required', 'Booking product requires date, time, duration, and resource data', array('status' => 400));
    }

    $original_post = $_POST;
    $original_request = $_REQUEST;
    $cart_item_data = array();

    if ($price_over !== null) $cart_item_data['cc_price_override'] = $price_over;
    if ($booking) {
        cc_populate_wc_bookings_post_fields($product_id, $booking);
        if (!empty($booking['serviceType'])) $cart_item_data['cc_service_type'] = sanitize_text_field((string) $booking['serviceType']);
        if (!empty($booking['notes']))       $cart_item_data['cc_customer_note'] = sanitize_textarea_field((string) $booking['notes']);
    }

    try {
        $cart_key = WC()->cart->add_to_cart($product_id, $quantity, 0, array(), $cart_item_data);
    } finally {
        $_POST = $original_post;
        $_REQUEST = $original_request;
    }

    if (!$cart_key) {
        $notices = function_exists('wc_get_notices') ? wc_get_notices('error') : array();
        $message = 'Could not add product to WooCommerce cart';
        if (!empty($notices)) {
            $first = reset($notices);
            if (is_array($first) && !empty($first['notice'])) $message = wp_strip_all_tags($first['notice']);
            elseif (is_string($first)) $message = wp_strip_all_tags($first);
        }
        if (function_exists('wc_clear_notices')) wc_clear_notices();
        return new WP_Error('add_to_cart_failed', $message, array('status' => 400));
    }

    cc_native_wc_persist_cart();
    return cc_cart_response();
}

function cc_cart_remove_item(WP_REST_Request $req) {
    $loaded = cc_native_wc_load_cart();
    if (is_wp_error($loaded)) return $loaded;
    $key = sanitize_text_field((string) $req->get_param('key'));
    if (!$key || !WC()->cart->remove_cart_item($key)) {
        return new WP_Error('cart_item_missing', 'Cart item not found', array('status' => 404));
    }
    cc_native_wc_persist_cart();
    return cc_cart_response();
}

add_action('woocommerce_before_calculate_totals', function ($cart) {
    if (is_admin() && !defined('DOING_AJAX')) return;
    if (!$cart) return;
    foreach ($cart->get_cart() as $cart_item) {
        if (isset($cart_item['cc_price_override']) && isset($cart_item['data']) && is_object($cart_item['data'])) {
            $cart_item['data']->set_price((float) $cart_item['cc_price_override']);
        }
    }
}, 20);

add_action('woocommerce_checkout_create_order_line_item', function ($item, $cart_item_key, $values, $order) {
    if (!empty($values['cc_service_type'])) {
        $item->add_meta_data('_service_type', sanitize_text_field((string) $values['cc_service_type']), true);
    }
    if (!empty($values['cc_customer_note'])) {
        $item->add_meta_data('_customer_note', sanitize_textarea_field((string) $values['cc_customer_note']), true);
    }
    if (isset($values['cc_price_override'])) {
        $item->add_meta_data('_cc_price_override', (string) ((float) $values['cc_price_override']), true);
    }
}, 20, 4);
