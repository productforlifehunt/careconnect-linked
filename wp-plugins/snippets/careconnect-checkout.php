<?php
/**
 * Snippet: careconnect-checkout
 * Run on: Frontend + Admin (Run snippet everywhere)
 *
 * Registers POST /wp-json/careconnect/v1/checkout and creates the order from
 * the REAL WooCommerce cart through WC_Checkout. This keeps WooCommerce
 * Bookings, Dokan commission/seller attribution, taxes, coupons, fees,
 * checkout line-item hooks, and payment gateway handoff in the native path.
 */
add_action('rest_api_init', function () {
    register_rest_route('careconnect/v1', '/checkout', array(
        'methods'             => 'POST',
        'permission_callback' => function () { return is_user_logged_in(); },
        'callback'            => 'cc_create_order_snippet',
    ));
});

function cc_checkout_native_load_cart() {
    if (function_exists('cc_native_wc_load_cart')) {
        return cc_native_wc_load_cart();
    }

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
        if (method_exists(WC(), 'initialize_session') && null === WC()->session) WC()->initialize_session();
        if (method_exists(WC(), 'initialize_cart') && null === WC()->cart) WC()->initialize_cart();
    }
    if (is_user_logged_in()) WC()->customer = new WC_Customer(get_current_user_id(), true);
    if (!WC()->cart) return new WP_Error('cart_missing', 'WooCommerce cart unavailable', array('status' => 500));
    if (WC()->session && method_exists(WC()->session, 'set_customer_session_cookie')) WC()->session->set_customer_session_cookie(true);
    if (method_exists(WC()->cart, 'get_cart_from_session')) WC()->cart->get_cart_from_session();
    return true;
}

function cc_checkout_native_persist_cart() {
    if (function_exists('cc_native_wc_persist_cart')) {
        cc_native_wc_persist_cart();
        return;
    }
    if (!WC()->cart) return;
    WC()->cart->calculate_totals();
    if (method_exists(WC()->cart, 'set_session')) WC()->cart->set_session();
    if (method_exists(WC()->cart, 'persistent_cart_update')) WC()->cart->persistent_cart_update();
}

function cc_create_order_snippet(WP_REST_Request $req) {
    if (!class_exists('WC_Checkout')) {
        return new WP_Error('wc_missing', 'WooCommerce checkout not active', array('status' => 500));
    }

    $loaded = cc_checkout_native_load_cart();
    if (is_wp_error($loaded)) return $loaded;
    if (WC()->cart->is_empty()) {
        return new WP_Error('empty_cart', 'WooCommerce cart is empty', array('status' => 400));
    }

    $params  = $req->get_json_params();
    $billing = isset($params['billing']) && is_array($params['billing']) ? $params['billing'] : array();

    $current_user = wp_get_current_user();
    $email = isset($billing['email']) ? sanitize_email($billing['email']) : ($current_user ? $current_user->user_email : '');
    $first = isset($billing['first_name']) ? sanitize_text_field($billing['first_name']) : ($current_user ? $current_user->first_name : '');
    $last  = isset($billing['last_name'])  ? sanitize_text_field($billing['last_name'])  : ($current_user ? $current_user->last_name : '');

    WC()->cart->calculate_totals();
    cc_checkout_native_persist_cart();

    $checkout = WC()->checkout();
    $data = array(
        'billing_first_name' => $first,
        'billing_last_name'  => $last,
        'billing_email'      => $email,
        'billing_phone'      => isset($billing['phone']) ? sanitize_text_field($billing['phone']) : '',
        'billing_address_1'  => isset($billing['address_1']) ? sanitize_text_field($billing['address_1']) : '',
        'billing_city'       => isset($billing['city']) ? sanitize_text_field($billing['city']) : '',
        'billing_state'      => isset($billing['state']) ? sanitize_text_field($billing['state']) : '',
        'billing_postcode'   => isset($billing['postcode']) ? sanitize_text_field($billing['postcode']) : '',
        'billing_country'    => isset($billing['country']) ? sanitize_text_field($billing['country']) : 'US',
        'shipping_first_name'=> $first,
        'shipping_last_name' => $last,
        'shipping_address_1' => isset($billing['address_1']) ? sanitize_text_field($billing['address_1']) : '',
        'shipping_city'      => isset($billing['city']) ? sanitize_text_field($billing['city']) : '',
        'shipping_state'     => isset($billing['state']) ? sanitize_text_field($billing['state']) : '',
        'shipping_postcode'  => isset($billing['postcode']) ? sanitize_text_field($billing['postcode']) : '',
        'shipping_country'   => isset($billing['country']) ? sanitize_text_field($billing['country']) : 'US',
        'payment_method'     => '',
        'terms'              => 1,
        'customer_id'        => get_current_user_id(),
    );

    $order_id = $checkout->create_order($data);
    if (is_wp_error($order_id)) return $order_id;

    $order = wc_get_order($order_id);
    if (!$order) {
        return new WP_Error('order_missing', 'Order could not be loaded after checkout', array('status' => 500));
    }

    // Keep unpaid orders pending and let the hosted Woo pay page run the
    // selected payment gateway. Do not mark paid here.
    if ($order->get_status() !== 'pending') {
        $order->set_status('pending');
    }
    $order->set_customer_id(get_current_user_id());
    $order->calculate_totals();
    $order->save();

    do_action('woocommerce_checkout_order_processed', $order_id, $data, $order);

    WC()->cart->empty_cart();
    cc_checkout_native_persist_cart();

    return rest_ensure_response(array(
        'id'          => $order->get_id(),
        'order_id'    => $order->get_id(),
        'order_key'   => $order->get_order_key(),
        'status'      => $order->get_status(),
        'total'       => $order->get_total(),
        'payment_url' => $order->get_checkout_payment_url(true),
    ));
}
