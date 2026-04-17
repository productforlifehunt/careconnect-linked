<?php
/**
 * Snippet: careconnect-quote-product
 * Run on: Frontend + Admin (Run snippet everywhere)
 *
 * Registers POST /wp-json/careconnect/v1/quote-product so any logged-in
 * buyer can create the hidden WooCommerce product corresponding to an
 * accepted quote. The product is owned by the seller (vendor) so Dokan
 * commission is attributed correctly.
 *
 * Deployed via the Code Snippets plugin, NOT by editing a plugin file —
 * per project rule (operate WP via GUI/snippets, never edit plugin code).
 */

add_action('rest_api_init', function () {
    register_rest_route('careconnect/v1', '/quote-product', array(
        'methods'             => 'POST',
        'permission_callback' => function () { return is_user_logged_in(); },
        'callback'            => 'cc_create_quote_product_snippet',
    ));
});

function cc_create_quote_product_snippet(WP_REST_Request $req) {
    if (!class_exists('WC_Product_Simple')) {
        return new WP_Error('wc_missing', 'WooCommerce not active', array('status' => 500));
    }
    $params      = $req->get_json_params();
    $amount      = isset($params['amount']) ? floatval($params['amount']) : 0;
    $vendor_id   = isset($params['vendor_user_id']) ? intval($params['vendor_user_id']) : 0;
    $name        = isset($params['name']) ? sanitize_text_field($params['name']) : 'Custom Quote';
    $description = isset($params['description']) ? wp_kses_post($params['description']) : '';
    $meta        = isset($params['meta']) && is_array($params['meta']) ? $params['meta'] : array();

    if ($amount <= 0)    return new WP_Error('bad_amount', 'Amount must be > 0', array('status' => 400));
    if ($vendor_id <= 0) return new WP_Error('bad_vendor', 'vendor_user_id required', array('status' => 400));
    if (!get_user_by('id', $vendor_id)) {
        return new WP_Error('vendor_missing', 'Vendor user not found', array('status' => 404));
    }

    $product = new WC_Product_Simple();
    $product->set_name($name);
    $product->set_status('publish');
    $product->set_catalog_visibility('hidden');
    $product->set_description($description);
    $product->set_short_description($description);
    $product->set_regular_price((string) $amount);
    $product->set_price((string) $amount);
    $product->set_virtual(true);
    $product->set_manage_stock(false);
    $product->set_stock_status('instock');

    foreach ($meta as $row) {
        if (!is_array($row) || empty($row['key'])) continue;
        $product->update_meta_data(sanitize_key($row['key']), sanitize_text_field((string) $row['value']));
    }
    $product->update_meta_data('_dokan_vendor_id', (string) $vendor_id);
    $product->update_meta_data('_is_quote_product', '1');

    $product_id = $product->save();
    if (!$product_id) {
        return new WP_Error('create_failed', 'Could not create product', array('status' => 500));
    }
    // post_author = vendor so Dokan attributes commission correctly.
    wp_update_post(array('ID' => $product_id, 'post_author' => $vendor_id));

    return rest_ensure_response(array(
        'id'    => (int) $product_id,
        'price' => (float) $amount,
    ));
}
