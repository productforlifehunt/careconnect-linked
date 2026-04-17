<?php
/**
 * Snippet: careconnect-cart
 * Run on: Frontend + Admin (Run snippet everywhere)
 *
 * Server-side cart for headless React app — replaces localStorage cart.
 * Persists per-user in user_meta so it survives across devices/sessions.
 *
 * Endpoints (all require is_user_logged_in via JWT):
 *   GET    /wp-json/careconnect/v1/cart                — read
 *   POST   /wp-json/careconnect/v1/cart/items          — add { product_id, quantity?, booking?, price_override? }
 *   DELETE /wp-json/careconnect/v1/cart/items/{key}    — remove one
 *   DELETE /wp-json/careconnect/v1/cart                — clear all
 *
 * Cart shape mirrors WC Store API response so the React UI is a drop-in:
 *   { items:[{key,id,name,quantity,prices:{price,currency_code},images,totals:{line_total},booking?}], totals:{total_price,currency_code}, items_count }
 *
 * Deployed via Code Snippets plugin.
 */

if (!defined('CC_CART_META_KEY')) define('CC_CART_META_KEY', '_cc_headless_cart');

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
    register_rest_route('careconnect/v1', '/cart/items/(?P<key>[A-Za-z0-9_]+)', array(
        'methods'             => 'DELETE',
        'permission_callback' => $auth,
        'callback'            => 'cc_cart_remove_item',
    ));
});

function cc_cart_load($user_id) {
    $raw = get_user_meta($user_id, CC_CART_META_KEY, true);
    if (!is_array($raw)) return array();
    return $raw;
}

function cc_cart_save($user_id, $items) {
    update_user_meta($user_id, CC_CART_META_KEY, $items);
}

function cc_cart_format_item($it) {
    $price_minor = (int) round(((float) $it['price']) * 100);
    $line_total  = (int) round(((float) $it['price']) * ((int) $it['quantity']) * 100);
    $out = array(
        'key'      => $it['key'],
        'id'       => (int) $it['product_id'],
        'name'     => (string) ($it['name'] ?? ''),
        'quantity' => (int) $it['quantity'],
        'prices'   => array('price' => (string) $price_minor, 'currency_code' => 'USD', 'currency_minor_unit' => 2, 'currency_symbol' => '$'),
        'images'   => !empty($it['image']) ? array(array('src' => $it['image'])) : array(),
        'totals'   => array('line_total' => (string) $line_total, 'currency_code' => 'USD', 'currency_minor_unit' => 2, 'currency_symbol' => '$'),
    );
    if (!empty($it['provider_id'])) $out['provider_id'] = $it['provider_id'];
    if (!empty($it['booking']))     $out['booking']     = $it['booking'];
    return $out;
}

function cc_cart_response($user_id) {
    $items = cc_cart_load($user_id);
    $total = 0.0;
    $count = 0;
    $formatted = array();
    foreach ($items as $it) {
        $total     += ((float) $it['price']) * ((int) $it['quantity']);
        $count     += (int) $it['quantity'];
        $formatted[] = cc_cart_format_item($it);
    }
    return rest_ensure_response(array(
        'items'        => $formatted,
        'totals'       => array(
            'total_price' => (string) ((int) round($total * 100)),
            'total_items' => (string) ((int) round($total * 100)),
            'currency_code' => 'USD',
            'currency_symbol' => '$',
            'currency_minor_unit' => 2,
        ),
        'items_count'  => $count,
    ));
}

function cc_cart_get(WP_REST_Request $req) {
    return cc_cart_response(get_current_user_id());
}

function cc_cart_clear(WP_REST_Request $req) {
    cc_cart_save(get_current_user_id(), array());
    return cc_cart_response(get_current_user_id());
}

function cc_cart_add_item(WP_REST_Request $req) {
    if (!class_exists('WC_Product')) {
        return new WP_Error('wc_missing', 'WooCommerce not active', array('status' => 500));
    }
    $params      = $req->get_json_params();
    $product_id  = isset($params['product_id']) ? (int) $params['product_id'] : 0;
    $quantity    = isset($params['quantity'])   ? max(1, (int) $params['quantity']) : 1;
    $booking     = isset($params['booking']) && is_array($params['booking']) ? $params['booking'] : null;
    $price_over  = isset($params['price_override']) ? (float) $params['price_override'] : null;

    if ($product_id <= 0) return new WP_Error('bad_product', 'product_id required', array('status' => 400));
    $product = wc_get_product($product_id);
    if (!$product) return new WP_Error('not_found', 'Product not found', array('status' => 404));

    // Base unit price = product price (or override for quote products that already include negotiated total).
    $unit_price = $price_over !== null ? $price_over : (float) $product->get_price();

    // For booking products, multiply by hours and add resource block_cost × hours.
    if ($booking && !empty($booking['durationHours'])) {
        $hours = (int) $booking['durationHours'];
        if ($price_over === null) $unit_price = $unit_price * $hours;
        if (!empty($booking['resourceId']) && function_exists('get_post_meta')) {
            $rid = (int) $booking['resourceId'];
            $block_cost = (float) get_post_meta($rid, 'block_cost', true);
            $unit_price += $block_cost * $hours;
        }
    }

    $image_url = '';
    $image_id  = $product->get_image_id();
    if ($image_id) $image_url = wp_get_attachment_url($image_id);

    $provider_id = '';
    foreach ($product->get_meta_data() as $m) {
        $d = $m->get_data();
        if (($d['key'] ?? '') === '_provider_id') { $provider_id = $d['value']; break; }
    }

    $items = cc_cart_load(get_current_user_id());
    if ($booking) {
        // Always create new line for bookings (unique date/time/resource).
        $items[] = array(
            'key'         => 'k' . wp_generate_uuid4(),
            'product_id'  => $product_id,
            'name'        => $product->get_name(),
            'price'       => $unit_price,
            'quantity'    => $quantity,
            'image'       => $image_url,
            'provider_id' => $provider_id,
            'booking'     => $booking,
        );
    } else {
        $merged = false;
        foreach ($items as &$existing) {
            if ((int) $existing['product_id'] === $product_id && empty($existing['booking'])) {
                $existing['quantity'] += $quantity;
                $merged = true;
                break;
            }
        }
        unset($existing);
        if (!$merged) {
            $items[] = array(
                'key'         => 'k' . wp_generate_uuid4(),
                'product_id'  => $product_id,
                'name'        => $product->get_name(),
                'price'       => $unit_price,
                'quantity'    => $quantity,
                'image'       => $image_url,
                'provider_id' => $provider_id,
            );
        }
    }
    cc_cart_save(get_current_user_id(), $items);
    return cc_cart_response(get_current_user_id());
}

function cc_cart_remove_item(WP_REST_Request $req) {
    $key = $req->get_param('key');
    $items = cc_cart_load(get_current_user_id());
    $items = array_values(array_filter($items, function ($i) use ($key) { return $i['key'] !== $key; }));
    cc_cart_save(get_current_user_id(), $items);
    return cc_cart_response(get_current_user_id());
}

// ─── Hook checkout to consume the server-side cart ───
// When the existing careconnect/v1/checkout snippet runs, if the caller
// didn't pass line_items but we have a server cart, build line_items from it
// and clear the cart on success.
add_filter('rest_pre_dispatch', function ($result, $server, $request) {
    if ($request->get_route() !== '/careconnect/v1/checkout') return $result;
    if ($request->get_method() !== 'POST') return $result;
    $body = $request->get_json_params();
    if (!empty($body['line_items'])) return $result; // explicit items wins
    if (!is_user_logged_in()) return $result;
    $items = cc_cart_load(get_current_user_id());
    if (empty($items)) return $result;
    $line_items = array();
    foreach ($items as $i) {
        $li = array(
            'product_id' => (int) $i['product_id'],
            'quantity'   => (int) $i['quantity'],
            'subtotal'   => (string) (((float) $i['price']) * ((int) $i['quantity'])),
            'total'      => (string) (((float) $i['price']) * ((int) $i['quantity'])),
        );
        if (!empty($i['booking'])) {
            $b = $i['booking'];
            $meta = array();
            if (!empty($b['startDate'])) {
                $parts = explode('-', $b['startDate']);
                if (count($parts) === 3) {
                    $meta[] = array('key' => 'wc_bookings_field_start_date_yy', 'value' => $parts[0]);
                    $meta[] = array('key' => 'wc_bookings_field_start_date_mm', 'value' => $parts[1]);
                    $meta[] = array('key' => 'wc_bookings_field_start_date_dd', 'value' => $parts[2]);
                }
            }
            if (!empty($b['startTime']))     $meta[] = array('key' => 'wc_bookings_field_start_date_time', 'value' => $b['startTime']);
            if (!empty($b['durationHours'])) $meta[] = array('key' => 'wc_bookings_field_duration', 'value' => (string) $b['durationHours']);
            if (!empty($b['resourceId']))    $meta[] = array('key' => 'wc_bookings_field_resource', 'value' => (string) $b['resourceId']);
            if (!empty($b['persons']) && is_array($b['persons'])) {
                foreach ($b['persons'] as $pid => $cnt) $meta[] = array('key' => 'wc_bookings_field_persons_' . $pid, 'value' => (string) $cnt);
            }
            if (!empty($b['serviceType'])) $meta[] = array('key' => '_service_type', 'value' => $b['serviceType']);
            if (!empty($b['notes']))       $meta[] = array('key' => '_customer_note', 'value' => $b['notes']);
            $li['meta_data'] = $meta;
        }
        $line_items[] = $li;
    }
    $body['line_items'] = $line_items;
    $request->set_body(wp_json_encode($body));
    // Mark for post-dispatch clear.
    $GLOBALS['cc_cart_should_clear_after_checkout'] = true;
    return $result;
}, 10, 3);

add_filter('rest_post_dispatch', function ($response, $server, $request) {
    if ($request->get_route() !== '/careconnect/v1/checkout') return $response;
    if (empty($GLOBALS['cc_cart_should_clear_after_checkout'])) return $response;
    if (is_a($response, 'WP_REST_Response') && $response->get_status() < 300 && is_user_logged_in()) {
        cc_cart_save(get_current_user_id(), array());
    }
    unset($GLOBALS['cc_cart_should_clear_after_checkout']);
    return $response;
}, 10, 3);
