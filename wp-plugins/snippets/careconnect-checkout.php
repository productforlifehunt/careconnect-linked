<?php
/**
 * Snippet: careconnect-checkout
 * Run on: Frontend + Admin (Run snippet everywhere)
 *
 * Registers POST /wp-json/careconnect/v1/checkout — accepts a payload of
 * line_items (with optional WC Bookings meta_data) plus billing info from
 * any logged-in user, and creates the WooCommerce order on their behalf.
 * Buyers don't have wc/v3/orders create-cap, so checkout otherwise 403s.
 *
 * Deployed via Code Snippets plugin (per project rule).
 */
add_action('rest_api_init', function () {
    register_rest_route('careconnect/v1', '/checkout', array(
        'methods'             => 'POST',
        'permission_callback' => function () { return is_user_logged_in(); },
        'callback'            => 'cc_create_order_snippet',
    ));
});

function cc_create_order_snippet(WP_REST_Request $req) {
    if (!class_exists('WC_Order')) {
        return new WP_Error('wc_missing', 'WooCommerce not active', array('status' => 500));
    }
    $params      = $req->get_json_params();
    $line_items  = isset($params['line_items']) && is_array($params['line_items']) ? $params['line_items'] : array();
    $billing     = isset($params['billing']) && is_array($params['billing']) ? $params['billing'] : array();
    $payment     = isset($params['payment_method']) ? sanitize_text_field($params['payment_method']) : 'cod';
    $payment_t   = isset($params['payment_method_title']) ? sanitize_text_field($params['payment_method_title']) : 'Cash on delivery';
    $set_paid    = !empty($params['set_paid']);
    $status      = isset($params['status']) ? sanitize_text_field($params['status']) : 'processing';

    if (empty($line_items)) {
        return new WP_Error('no_items', 'line_items required', array('status' => 400));
    }

    $order = wc_create_order(array('customer_id' => get_current_user_id()));
    if (is_wp_error($order)) return $order;

    foreach ($line_items as $li) {
        $pid = isset($li['product_id']) ? intval($li['product_id']) : 0;
        if ($pid <= 0) continue;
        $qty = isset($li['quantity']) ? intval($li['quantity']) : 1;
        $product = wc_get_product($pid);
        if (!$product) continue;
        $item_id = $order->add_product($product, $qty);
        $item    = $order->get_item($item_id);
        if (!$item) continue;

        // Forced per-line totals (e.g. resource surcharge × hours).
        if (isset($li['subtotal'])) $item->set_subtotal((float) $li['subtotal']);
        if (isset($li['total']))    $item->set_total((float) $li['total']);

        if (!empty($li['meta_data']) && is_array($li['meta_data'])) {
            foreach ($li['meta_data'] as $m) {
                if (!is_array($m) || empty($m['key'])) continue;
                $item->add_meta_data(sanitize_text_field((string) $m['key']), sanitize_text_field((string) $m['value']));
            }
        }
        $item->save();
    }

    if (!empty($billing)) {
        $order->set_address(array(
            'first_name' => isset($billing['first_name']) ? sanitize_text_field($billing['first_name']) : '',
            'last_name'  => isset($billing['last_name'])  ? sanitize_text_field($billing['last_name'])  : '',
            'email'      => isset($billing['email'])      ? sanitize_email($billing['email'])           : '',
            'phone'      => isset($billing['phone'])      ? sanitize_text_field($billing['phone'])      : '',
            'address_1'  => isset($billing['address_1'])  ? sanitize_text_field($billing['address_1'])  : '',
            'city'       => isset($billing['city'])       ? sanitize_text_field($billing['city'])       : '',
            'state'      => isset($billing['state'])      ? sanitize_text_field($billing['state'])      : '',
            'postcode'   => isset($billing['postcode'])   ? sanitize_text_field($billing['postcode'])   : '',
            'country'    => isset($billing['country'])    ? sanitize_text_field($billing['country'])    : 'US',
        ), 'billing');
    }

    $order->set_payment_method($payment);
    $order->set_payment_method_title($payment_t);
    $order->calculate_totals();
    $order->set_status($status);
    if ($set_paid) {
        $order->payment_complete();
    }
    $order->save();

    return rest_ensure_response(array(
        'id'        => $order->get_id(),
        'order_id'  => $order->get_id(),
        'order_key' => $order->get_order_key(),
        'status'    => $order->get_status(),
        'total'     => $order->get_total(),
    ));
}
