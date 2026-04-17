# Consultation Delivery System — WP GUI Setup Guide

> **MANDATORY**: Follow 90-year-old GUI mode. Do **NOT** edit theme files,
> snippets, or run REST mutations to configure. Click through the WP admin.

## Architecture Recap

- **No new tables, no new JetEngine relations.**
- All delivery state lives on `WC Order → line_items → meta_data`.
- 4 delivery modes share the same data model.
- Buyer sign-off (or 7-day auto-confirm cron) triggers Dokan payout.

## Step 1 — WC Product Templates (4 templates)

Vendors clone these to publish a consultation service.

Go to **WP Admin → Products → Add New**. Create 4 products with these settings:

### Template A: Video Consultation (`视频问诊`)
- Title: "Video Consultation Template"
- Type: **Simple product**, **Virtual** ✅
- Price: vendor sets per duration
- Categories: `care-services`
- Tags: `consultation`, `video`
- **Custom Fields** (Product → Advanced → Custom Fields, click "Enter new"):
  - `_default_delivery_type` = `video`
  - `_default_duration_min` = `30`

### Template B: Text Chat Consultation (`文字咨询`)
- Same as above, but:
  - `_default_delivery_type` = `text`
  - `_default_duration_min` = `60`

### Template C: Async Q&A (`异步图文问诊`)
- Same as above, but:
  - `_default_delivery_type` = `async`
  - `_default_response_sla_h` = `24`

### Template D: Care Plan Document (`护理方案文档`)
- Same as above, but:
  - `_default_delivery_type` = `care_plan`
  - `_default_delivery_sla_h` = `72`

## Step 2 — WP Hook (one-time, via Code Snippets plugin GUI)

> Use the **Code Snippets** plugin (Tools → Snippets → Add New).
> This is the *one* allowed snippet — it's the bridge that copies the product's
> `_default_delivery_type` to the order line item upon checkout.

```php
add_action('woocommerce_checkout_create_order_line_item', function($item, $cart_item_key, $values, $order) {
    $product_id = $item->get_product_id();
    $delivery_type = get_post_meta($product_id, '_default_delivery_type', true);
    if (!$delivery_type) return;
    $item->add_meta_data('_delivery_type', $delivery_type, true);
    $item->add_meta_data('_delivery_status', 'pending', true);
    // Auto-create Jitsi room for video consultations
    if ($delivery_type === 'video') {
        $room = 'cc-' . $order->get_id() . '-' . wp_generate_password(6, false, false);
        $item->add_meta_data('_meeting_url', 'https://meet.jit.si/' . $room, true);
    }
}, 10, 4);
```

Activate snippet name: **"Consultation: copy delivery type to order item"**.
Run scope: **Frontend only**.

## Step 3 — Dokan Payout Behavior

No config needed. When the buyer clicks **"Confirm & Release Payment"** in
the React `ConsultationRoom`, the frontend calls `PUT /wc/v3/orders/{id}`
with `status=completed`, which triggers Dokan's standard commission release.

For 7-day auto-confirm, set up **WP-Cron** (already running) — see Step 4.

## Step 4 — Auto-confirm Cron (optional snippet, also via plugin GUI)

```php
add_action('cc_auto_confirm_deliveries', function() {
    $orders = wc_get_orders(['status' => 'processing', 'limit' => 200]);
    foreach ($orders as $order) {
        foreach ($order->get_items() as $item) {
            $auto = $item->get_meta('_auto_confirm_at');
            $status = $item->get_meta('_delivery_status');
            if ($status === 'delivered' && $auto && strtotime($auto) < time()) {
                $item->update_meta_data('_delivery_status', 'auto_confirmed');
                $item->update_meta_data('_confirmed_at', current_time('c'));
                $item->save();
                $order->update_status('completed', 'Auto-confirmed after 7 days');
            }
        }
    }
});
if (!wp_next_scheduled('cc_auto_confirm_deliveries')) {
    wp_schedule_event(time(), 'hourly', 'cc_auto_confirm_deliveries');
}
```

## Step 5 — Frontend Routes

Already wired in `src/App.tsx`:

- `/consultation/:orderId/:itemId` — patient view
- `/consultation/:orderId/:itemId?provider=1` — provider view

## Verification Checklist

- [ ] 4 product templates exist in `Products → All Products`
- [ ] Snippet "Consultation: copy delivery type to order item" is **Active**
- [ ] Place a test order with the video template → check the order's line item
      has `_delivery_type=video` and `_meeting_url=https://meet.jit.si/...`
- [ ] Open `/consultation/{orderId}/{itemId}` → Jitsi iframe loads
- [ ] Open `?provider=1` → SOAP form + "Mark Delivered" button visible
- [ ] After Mark Delivered, buyer view shows "Confirm & Release" button
- [ ] After Confirm, order status becomes `completed` in WC admin
