# Upstream Medusa Model Inventory

This document tracks the Medusa upstream model sources currently extracted from the local checkout at:

`SupaMedusa/_upstream/medusa`

The goal of this inventory is to keep SupaMedusa aligned to upstream Medusa naming and structure.

## Core commerce modules extracted

### Product

Source directory:

`packages/modules/product/src/models`

Observed models:

- `product`
- `product_variant`
- `product_option`
- `product_option_value`
- `product_category`
- `product_collection`
- `image`
- `product_tag`
- `product_type`
- `product_variant_product_image`
- join tables including `product_tags`, `product_category_product`, `product_variant_option`

### Cart

Source directory:

`packages/modules/cart/src/models`

Observed models:

- `cart`
- `cart_address`
- `cart_line_item`
- `cart_line_item_adjustment`
- `cart_line_item_tax_line`
- `cart_shipping_method`
- `cart_shipping_method_adjustment`
- `cart_shipping_method_tax_line`
- `credit_line`

### Order

Source directory:

`packages/modules/order/src/models`

Observed models:

- `order`
- `order_address`
- `order_item`
- `order_line_item`
- `order_summary`
- `order_shipping`
- `order_shipping_method`
- `order_transaction`
- `order_credit_line`
- `order_change`
- `order_change_action`
- `return`
- `return_item`
- `return_reason`
- `claim`
- `claim_item`
- `claim_item_image`
- `exchange`
- `exchange_item`

### Customer

Source directory:

`packages/modules/customer/src/models`

Observed models:

- `customer`
- `customer_address`
- `customer_group`
- `customer_group_customer`

### Payment

Source directory:

`packages/modules/payment/src/models`

Observed models:

- `payment_collection`
- `payment_session`
- `payment`
- `payment_provider`
- `capture`
- `refund`
- `refund_reason`
- `account_holder`

### Pricing

Source directory:

`packages/modules/pricing/src/models`

Observed models:

- `price_set`
- `price`
- `price_list`
- `price_list_rule`
- `price_rule`
- `price_preference`

### Promotion

Source directory:

`packages/modules/promotion/src/models`

Observed models:

- `promotion`
- `promotion_campaign`
- `promotion_campaign_budget`
- `promotion_campaign_budget_usage`
- `promotion_application_method`
- `promotion_rule`
- `promotion_rule_value`
- join tables for promotion-rule and application-method-rule links

### Fulfillment

Source directory:

`packages/modules/fulfillment/src/models`

Observed models:

- `fulfillment`
- `fulfillment_item`
- `fulfillment_label`
- `fulfillment_provider`
- `fulfillment_set`
- `fulfillment_address`
- `service_zone`
- `geo_zone`
- `shipping_option`
- `shipping_option_rule`
- `shipping_option_type`
- `shipping_profile`

## Support modules extracted

### Inventory

Source directory:

`packages/modules/inventory/src/models`

Observed models:

- `inventory_item`
- `inventory_level`
- `reservation_item`

### Region

Source directory:

`packages/modules/region/src/models`

Observed models:

- `region`
- `region_country`

### Sales Channel

Source directory:

`packages/modules/sales-channel/src/models`

Observed models:

- `sales_channel`

### Store

Source directory:

`packages/modules/store/src/models`

Observed models:

- `store`
- `store_currency`
- `store_locale`

### Tax

Source directory:

`packages/modules/tax/src/models`

Observed models:

- `tax_provider`
- `tax_region`
- `tax_rate`
- `tax_rate_rule`

### User

Source directory:

`packages/modules/user/src/models`

Observed models:

- `user`
- `invite`

### Auth

Source directory:

`packages/modules/auth/src/models`

Observed models:

- `auth_identity`
- `provider_identity`

### API Key

Source directory:

`packages/modules/api-key/src/models`

Observed models:

- `api_key`

### Currency

Source directory:

`packages/modules/currency/src/models`

Observed models:

- `currency`

### Stock Location

Source directory:

`packages/modules/stock-location/src/models`

Observed models:

- `stock_location`
- `stock_location_address`

### Notification

Source directory:

`packages/modules/notification/src/models`

Observed models:

- `notification`
- `notification_provider`

### RBAC

Source directory:

`packages/modules/rbac/src/models`

Observed models partially extracted:

- `rbac_role`
- `rbac_policy`
- additional role relation models still to be fully read from local checkout

### Settings

Source directory:

`packages/modules/settings/src/models`

Observed models:

- `user_preference`
- `view_configuration`

## Remaining extraction work

Still to finalize from local upstream source:

- remaining RBAC relation models
- exact migration inventory for every module
- exact join-table coverage where generated implicitly by Medusa model DSL
- exact index and constraint cross-check against module migrations

## Policy

SupaMedusa should treat upstream Medusa source and migrations as canonical. Schema generation should preserve upstream naming exactly unless blocked by a hard Supabase/Postgres incompatibility.
