# Medusa 真实 Data Model（来自 repo schema）
权威来源：`/Users/guoweijiang/Downloads/challenged/SupaMedusa/schema/*.sql`
- 结论：**不是只有你列的这些表**。
- 当前 repo 中 Medusa schema 总计：**150 tables**。
- 文档编号方式：**全局唯一编号 1-150**，并保留 schema 文件分类与顺序。
- 你列出的表里，真实存在且命名匹配的有：**15 个**。
- 你漏掉的真实 Medusa tables：**135 个**。

## 你的列表是否完整
| Item | Result |
|---|---|
| 你给的列表是不是全部 Medusa tables | **不是** |
| 真实 repo Medusa tables 总数 | **150** |
| 你列中的有效表数 | **15** |
| 你漏掉的表数 | **135** |

## 你给的这批表
| # | Table | Exists in repo |
|---|---|---|
| 1 | `product` | ✅ |
| 2 | `product_variant` | ✅ |
| 3 | `product_option` | ✅ |
| 4 | `product_option_value` | ✅ |
| 5 | `product_category` | ✅ |
| 6 | `product_collection` | ✅ |
| 7 | `product_tag` | ✅ |
| 8 | `product_type` | ✅ |
| 9 | `image` | ✅ |
| 10 | `price_set` | ✅ |
| 11 | `price` | ✅ |
| 12 | `price_rule` | ✅ |
| 13 | `price_list` | ✅ |
| 14 | `price_list_rule` | ✅ |
| 15 | `notification` | ✅ |

## 00 Extensions
_No tables defined in this file._

## 01 Product
### 1. `product_type`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `value` | `text NOT NULL` | NOT NULL |
| `metadata` | `jsonb NULL` | NULLABLE |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 2. `product_collection`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `title` | `text NOT NULL` | NOT NULL |
| `handle` | `text NOT NULL` | NOT NULL |
| `metadata` | `jsonb NULL` | NULLABLE |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 3. `product`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `title` | `text NOT NULL` | NOT NULL |
| `handle` | `text NOT NULL` | NOT NULL |
| `subtitle` | `text NULL` | NULLABLE |
| `description` | `text NULL` | NULLABLE |
| `is_giftcard` | `boolean NOT NULL DEFAULT false` | NOT NULL |
| `status` | `text CHECK ("status" IN ('draft', 'proposed', 'published', 'rejected')) NOT NULL` | NOT NULL |
| `thumbnail` | `text NULL` | NULLABLE |
| `weight` | `text NULL` | NULLABLE |
| `length` | `text NULL` | NULLABLE |
| `height` | `text NULL` | NULLABLE |
| `width` | `text NULL` | NULLABLE |
| `origin_country` | `text NULL` | NULLABLE |
| `hs_code` | `text NULL` | NULLABLE |
| `mid_code` | `text NULL` | NULLABLE |
| `material` | `text NULL` | NULLABLE |
| `collection_id` | `text NULL` | NULLABLE |
| `type_id` | `text NULL` | NULLABLE |
| `discountable` | `boolean NOT NULL DEFAULT true` | NOT NULL |
| `external_id` | `text NULL` | NULLABLE |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |
| `metadata` | `jsonb NULL` | NULLABLE |

### 4. `product_variant`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `title` | `text NOT NULL` | NOT NULL |
| `sku` | `text NULL` | NULLABLE |
| `barcode` | `text NULL` | NULLABLE |
| `ean` | `text NULL` | NULLABLE |
| `upc` | `text NULL` | NULLABLE |
| `allow_backorder` | `boolean NOT NULL DEFAULT false` | NOT NULL |
| `manage_inventory` | `boolean NOT NULL DEFAULT true` | NOT NULL |
| `hs_code` | `text NULL` | NULLABLE |
| `origin_country` | `text NULL` | NULLABLE |
| `mid_code` | `text NULL` | NULLABLE |
| `material` | `text NULL` | NULLABLE |
| `weight` | `numeric NULL` | NULLABLE |
| `length` | `numeric NULL` | NULLABLE |
| `height` | `numeric NULL` | NULLABLE |
| `width` | `numeric NULL` | NULLABLE |
| `metadata` | `jsonb NULL` | NULLABLE |
| `variant_rank` | `numeric NULL DEFAULT 0` | NULLABLE |
| `thumbnail` | `text NULL` | NULLABLE |
| `product_id` | `text NULL` | NULLABLE |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 5. `product_option`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `title` | `text NOT NULL` | NOT NULL |
| `product_id` | `text NULL` | NULLABLE |
| `metadata` | `jsonb NULL` | NULLABLE |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 6. `product_option_value`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `value` | `text NOT NULL` | NOT NULL |
| `option_id` | `text NULL` | NULLABLE |
| `metadata` | `jsonb NULL` | NULLABLE |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 7. `image`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `url` | `text NOT NULL` | NOT NULL |
| `rank` | `integer NOT NULL DEFAULT 0` | NOT NULL |
| `product_id` | `text NOT NULL` | NOT NULL |
| `metadata` | `jsonb NULL` | NULLABLE |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 8. `product_tag`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `value` | `text NOT NULL` | NOT NULL |
| `metadata` | `jsonb NULL` | NULLABLE |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 9. `product_category`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `name` | `text NOT NULL` | NOT NULL |
| `description` | `text NOT NULL DEFAULT ''` | NOT NULL |
| `handle` | `text NOT NULL` | NOT NULL |
| `mpath` | `text NOT NULL` | NOT NULL |
| `is_active` | `boolean NOT NULL DEFAULT false` | NOT NULL |
| `is_internal` | `boolean NOT NULL DEFAULT false` | NOT NULL |
| `rank` | `numeric NOT NULL DEFAULT 0` | NOT NULL |
| `parent_category_id` | `text NULL` | NULLABLE |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |
| `metadata` | `jsonb NULL` | NULLABLE |

### 10. `product_tags`
| Column | Type / Definition | Nullability |
|---|---|---|
| `product_id` | `text NOT NULL` | NOT NULL |
| `product_tag_id` | `text NOT NULL` | NOT NULL |

### 11. `product_variant_product_image`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `variant_id` | `text NOT NULL` | NOT NULL |
| `image_id` | `text NOT NULL` | NOT NULL |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 12. `product_category_product`
| Column | Type / Definition | Nullability |
|---|---|---|
| `product_id` | `text NOT NULL` | NOT NULL |
| `product_category_id` | `text NOT NULL` | NOT NULL |

### 13. `product_variant_option`
| Column | Type / Definition | Nullability |
|---|---|---|
| `variant_id` | `text NOT NULL` | NOT NULL |
| `option_value_id` | `text NOT NULL` | NOT NULL |

## 02 Cart
### 14. `cart_address`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `customer_id` | `text NULL` | NULLABLE |
| `company` | `text NULL` | NULLABLE |
| `first_name` | `text NULL` | NULLABLE |
| `last_name` | `text NULL` | NULLABLE |
| `address_1` | `text NULL` | NULLABLE |
| `address_2` | `text NULL` | NULLABLE |
| `city` | `text NULL` | NULLABLE |
| `country_code` | `text NULL` | NULLABLE |
| `province` | `text NULL` | NULLABLE |
| `postal_code` | `text NULL` | NULLABLE |
| `phone` | `text NULL` | NULLABLE |
| `metadata` | `jsonb NULL` | NULLABLE |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 15. `cart`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `region_id` | `text NULL` | NULLABLE |
| `customer_id` | `text NULL` | NULLABLE |
| `sales_channel_id` | `text NULL` | NULLABLE |
| `email` | `text NULL` | NULLABLE |
| `currency_code` | `text NOT NULL` | NOT NULL |
| `shipping_address_id` | `text NULL` | NULLABLE |
| `billing_address_id` | `text NULL` | NULLABLE |
| `locale` | `text NULL` | NULLABLE |
| `metadata` | `jsonb NULL` | NULLABLE |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 16. `cart_line_item`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `cart_id` | `text NOT NULL` | NOT NULL |
| `title` | `text NOT NULL` | NOT NULL |
| `subtitle` | `text NULL` | NULLABLE |
| `thumbnail` | `text NULL` | NULLABLE |
| `quantity` | `integer NOT NULL` | NOT NULL |
| `variant_id` | `text NULL` | NULLABLE |
| `product_id` | `text NULL` | NULLABLE |
| `product_title` | `text NULL` | NULLABLE |
| `product_description` | `text NULL` | NULLABLE |
| `product_subtitle` | `text NULL` | NULLABLE |
| `product_type` | `text NULL` | NULLABLE |
| `product_collection` | `text NULL` | NULLABLE |
| `product_handle` | `text NULL` | NULLABLE |
| `variant_sku` | `text NULL` | NULLABLE |
| `variant_barcode` | `text NULL` | NULLABLE |
| `variant_title` | `text NULL` | NULLABLE |
| `variant_option_values` | `jsonb NULL` | NULLABLE |
| `requires_shipping` | `boolean NOT NULL DEFAULT true` | NOT NULL |
| `is_discountable` | `boolean NOT NULL DEFAULT true` | NOT NULL |
| `is_tax_inclusive` | `boolean NOT NULL DEFAULT false` | NOT NULL |
| `is_custom_price` | `boolean NOT NULL DEFAULT false` | NOT NULL |
| `is_giftcard` | `boolean NOT NULL DEFAULT false` | NOT NULL |
| `product_type_id` | `text NULL` | NULLABLE |
| `compare_at_unit_price` | `numeric NULL` | NULLABLE |
| `raw_compare_at_unit_price` | `jsonb NULL` | NULLABLE |
| `unit_price` | `numeric NOT NULL` | NOT NULL |
| `raw_unit_price` | `jsonb NOT NULL` | NOT NULL |
| `metadata` | `jsonb NULL` | NULLABLE |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 17. `cart_line_item_adjustment`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `description` | `text NULL` | NULLABLE |
| `promotion_id` | `text NULL` | NULLABLE |
| `code` | `text NULL` | NULLABLE |
| `amount` | `numeric NOT NULL` | NOT NULL |
| `raw_amount` | `jsonb NOT NULL` | NOT NULL |
| `provider_id` | `text NULL` | NULLABLE |
| `is_tax_inclusive` | `boolean NOT NULL DEFAULT false` | NOT NULL |
| `metadata` | `jsonb NULL` | NULLABLE |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |
| `item_id` | `text NULL` | NULLABLE |

### 18. `cart_line_item_tax_line`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `description` | `text NULL` | NULLABLE |
| `tax_rate_id` | `text NULL` | NULLABLE |
| `code` | `text NOT NULL` | NOT NULL |
| `rate` | `numeric NOT NULL` | NOT NULL |
| `provider_id` | `text NULL` | NULLABLE |
| `metadata` | `jsonb NULL` | NULLABLE |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |
| `item_id` | `text NULL` | NULLABLE |

### 19. `cart_shipping_method`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `cart_id` | `text NOT NULL` | NOT NULL |
| `name` | `text NOT NULL` | NOT NULL |
| `description` | `jsonb NULL` | NULLABLE |
| `amount` | `numeric NOT NULL` | NOT NULL |
| `raw_amount` | `jsonb NOT NULL` | NOT NULL |
| `is_tax_inclusive` | `boolean NOT NULL DEFAULT false` | NOT NULL |
| `shipping_option_id` | `text NULL` | NULLABLE |
| `data` | `jsonb NULL` | NULLABLE |
| `metadata` | `jsonb NULL` | NULLABLE |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 20. `cart_shipping_method_adjustment`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `description` | `text NULL` | NULLABLE |
| `promotion_id` | `text NULL` | NULLABLE |
| `code` | `text NULL` | NULLABLE |
| `amount` | `numeric NOT NULL` | NOT NULL |
| `raw_amount` | `jsonb NOT NULL` | NOT NULL |
| `provider_id` | `text NULL` | NULLABLE |
| `metadata` | `jsonb NULL` | NULLABLE |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |
| `shipping_method_id` | `text NULL` | NULLABLE |

### 21. `cart_shipping_method_tax_line`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `description` | `text NULL` | NULLABLE |
| `tax_rate_id` | `text NULL` | NULLABLE |
| `code` | `text NOT NULL` | NOT NULL |
| `rate` | `numeric NOT NULL` | NOT NULL |
| `provider_id` | `text NULL` | NULLABLE |
| `metadata` | `jsonb NULL` | NULLABLE |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |
| `shipping_method_id` | `text NULL` | NULLABLE |

### 22. `credit_line`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL, "cart_id" text NOT NULL, "reference" text NULL, "reference_id" text NULL` | NOT NULL |
| `amount` | `numeric NOT NULL, "raw_amount" jsonb NOT NULL, "metadata" jsonb NULL` | NOT NULL |
| `created_at` | `timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

## 03 Customer
### 23. `customer`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `company_name` | `text NULL` | NULLABLE |
| `first_name` | `text NULL` | NULLABLE |
| `last_name` | `text NULL` | NULLABLE |
| `email` | `text NULL` | NULLABLE |
| `phone` | `text NULL` | NULLABLE |
| `has_account` | `boolean NOT NULL DEFAULT false` | NOT NULL |
| `metadata` | `jsonb NULL` | NULLABLE |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |
| `created_by` | `text NULL` | NULLABLE |

### 24. `customer_address`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `customer_id` | `text NOT NULL` | NOT NULL |
| `address_name` | `text NULL` | NULLABLE |
| `is_default_shipping` | `boolean NOT NULL DEFAULT false` | NOT NULL |
| `is_default_billing` | `boolean NOT NULL DEFAULT false` | NOT NULL |
| `company` | `text NULL` | NULLABLE |
| `first_name` | `text NULL` | NULLABLE |
| `last_name` | `text NULL` | NULLABLE |
| `address_1` | `text NULL` | NULLABLE |
| `address_2` | `text NULL` | NULLABLE |
| `city` | `text NULL` | NULLABLE |
| `country_code` | `text NULL` | NULLABLE |
| `province` | `text NULL` | NULLABLE |
| `postal_code` | `text NULL` | NULLABLE |
| `phone` | `text NULL` | NULLABLE |
| `metadata` | `jsonb NULL` | NULLABLE |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 25. `customer_group`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `name` | `text NULL` | NULLABLE |
| `metadata` | `jsonb NULL` | NULLABLE |
| `created_by` | `text NULL` | NULLABLE |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 26. `customer_group_customer`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `customer_id` | `text NOT NULL` | NOT NULL |
| `customer_group_id` | `text NOT NULL` | NOT NULL |
| `metadata` | `jsonb NULL` | NULLABLE |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `created_by` | `text NULL` | NULLABLE |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

## 04 Order
### 27. `order_address`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `TEXT NOT NULL` | NOT NULL |
| `customer_id` | `TEXT NULL` | NULLABLE |
| `company` | `TEXT NULL` | NULLABLE |
| `first_name` | `TEXT NULL` | NULLABLE |
| `last_name` | `TEXT NULL` | NULLABLE |
| `address_1` | `TEXT NULL` | NULLABLE |
| `address_2` | `TEXT NULL` | NULLABLE |
| `city` | `TEXT NULL` | NULLABLE |
| `country_code` | `TEXT NULL` | NULLABLE |
| `province` | `TEXT NULL` | NULLABLE |
| `postal_code` | `TEXT NULL` | NULLABLE |
| `phone` | `TEXT NULL` | NULLABLE |
| `metadata` | `JSONB NULL` | NULLABLE |
| `created_at` | `TIMESTAMPTZ NOT NULL DEFAULT Now()` | NOT NULL |
| `updated_at` | `TIMESTAMPTZ NOT NULL DEFAULT Now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 28. `order`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `TEXT NOT NULL` | NOT NULL |
| `region_id` | `TEXT NULL` | NULLABLE |
| `display_id` | `SERIAL` | NULLABLE |
| `customer_id` | `TEXT NULL` | NULLABLE |
| `version` | `INTEGER NOT NULL DEFAULT 1` | NOT NULL |
| `sales_channel_id` | `TEXT NULL` | NULLABLE |
| `status` | `order_status_enum NOT NULL DEFAULT 'pending'` | NOT NULL |
| `is_draft_order` | `BOOLEAN NOT NULL DEFAULT false` | NOT NULL |
| `email` | `text NULL` | NULLABLE |
| `currency_code` | `text NOT NULL` | NOT NULL |
| `shipping_address_id` | `text NULL` | NULLABLE |
| `billing_address_id` | `text NULL` | NULLABLE |
| `no_notification` | `boolean NULL` | NULLABLE |
| `custom_display_id` | `text NULL` | NULLABLE |
| `locale` | `text NULL` | NULLABLE |
| `metadata` | `jsonb NULL` | NULLABLE |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |
| `canceled_at` | `timestamptz NULL` | NULLABLE |

### 29. `order_summary`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `TEXT NOT NULL` | NOT NULL |
| `order_id` | `TEXT NOT NULL` | NOT NULL |
| `version` | `INTEGER NOT NULL DEFAULT 1` | NOT NULL |
| `totals` | `JSONB NULL` | NULLABLE |
| `created_at` | `TIMESTAMPTZ NOT NULL DEFAULT Now()` | NOT NULL |
| `updated_at` | `TIMESTAMPTZ NOT NULL DEFAULT Now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 30. `order_line_item`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `TEXT NOT NULL` | NOT NULL |
| `totals_id` | `TEXT NULL` | NULLABLE |
| `title` | `TEXT NOT NULL` | NOT NULL |
| `subtitle` | `TEXT NULL` | NULLABLE |
| `thumbnail` | `TEXT NULL` | NULLABLE |
| `variant_id` | `TEXT NULL` | NULLABLE |
| `product_id` | `TEXT NULL` | NULLABLE |
| `product_title` | `TEXT NULL` | NULLABLE |
| `product_description` | `TEXT NULL` | NULLABLE |
| `product_subtitle` | `TEXT NULL` | NULLABLE |
| `product_type` | `TEXT NULL` | NULLABLE |
| `product_collection` | `TEXT NULL` | NULLABLE |
| `product_handle` | `TEXT NULL` | NULLABLE |
| `variant_sku` | `TEXT NULL` | NULLABLE |
| `variant_barcode` | `TEXT NULL` | NULLABLE |
| `variant_title` | `TEXT NULL` | NULLABLE |
| `variant_option_values` | `JSONB NULL` | NULLABLE |
| `requires_shipping` | `BOOLEAN NOT NULL DEFAULT true` | NOT NULL |
| `is_discountable` | `BOOLEAN NOT NULL DEFAULT true` | NOT NULL |
| `is_tax_inclusive` | `BOOLEAN NOT NULL DEFAULT false` | NOT NULL |
| `is_custom_price` | `boolean NOT NULL DEFAULT false` | NOT NULL |
| `is_giftcard` | `boolean NOT NULL DEFAULT false` | NOT NULL |
| `product_type_id` | `text NULL` | NULLABLE |
| `compare_at_unit_price` | `NUMERIC NULL` | NULLABLE |
| `raw_compare_at_unit_price` | `JSONB NULL` | NULLABLE |
| `unit_price` | `NUMERIC NOT NULL` | NOT NULL |
| `raw_unit_price` | `JSONB NOT NULL` | NOT NULL |
| `metadata` | `JSONB NULL` | NULLABLE |
| `created_at` | `TIMESTAMPTZ NOT NULL DEFAULT Now()` | NOT NULL |
| `updated_at` | `TIMESTAMPTZ NOT NULL DEFAULT Now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 31. `order_item`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `TEXT NOT NULL` | NOT NULL |
| `order_id` | `TEXT NOT NULL` | NOT NULL |
| `version` | `INTEGER NOT NULL` | NOT NULL |
| `item_id` | `TEXT NOT NULL` | NOT NULL |
| `quantity` | `NUMERIC NOT NULL` | NOT NULL |
| `raw_quantity` | `JSONB NOT NULL` | NOT NULL |
| `fulfilled_quantity` | `NUMERIC NOT NULL` | NOT NULL |
| `raw_fulfilled_quantity` | `JSONB NOT NULL` | NOT NULL |
| `shipped_quantity` | `NUMERIC NOT NULL` | NOT NULL |
| `raw_shipped_quantity` | `JSONB NOT NULL` | NOT NULL |
| `return_requested_quantity` | `NUMERIC NOT NULL` | NOT NULL |
| `raw_return_requested_quantity` | `JSONB NOT NULL` | NOT NULL |
| `return_received_quantity` | `NUMERIC NOT NULL` | NOT NULL |
| `raw_return_received_quantity` | `JSONB NOT NULL` | NOT NULL |
| `return_dismissed_quantity` | `NUMERIC NOT NULL` | NOT NULL |
| `raw_return_dismissed_quantity` | `JSONB NOT NULL` | NOT NULL |
| `written_off_quantity` | `NUMERIC NOT NULL` | NOT NULL |
| `raw_written_off_quantity` | `JSONB NOT NULL` | NOT NULL |
| `delivered_quantity` | `NUMERIC NOT NULL DEFAULT 0` | NOT NULL |
| `raw_delivered_quantity` | `JSONB NULL` | NULLABLE |
| `unit_price` | `NUMERIC NULL` | NULLABLE |
| `raw_unit_price` | `JSONB NULL` | NULLABLE |
| `compare_at_unit_price` | `NUMERIC NULL` | NULLABLE |
| `raw_compare_at_unit_price` | `JSONB NULL` | NULLABLE |
| `metadata` | `JSONB NULL` | NULLABLE |
| `created_at` | `TIMESTAMPTZ NOT NULL DEFAULT Now()` | NOT NULL |
| `updated_at` | `TIMESTAMPTZ NOT NULL DEFAULT Now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 32. `order_shipping_method`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `TEXT NOT NULL` | NOT NULL |
| `name` | `TEXT NOT NULL` | NOT NULL |
| `description` | `JSONB NULL` | NULLABLE |
| `amount` | `NUMERIC NOT NULL` | NOT NULL |
| `raw_amount` | `JSONB NOT NULL` | NOT NULL |
| `is_tax_inclusive` | `BOOLEAN NOT NULL DEFAULT false` | NOT NULL |
| `is_custom_amount` | `boolean NOT NULL DEFAULT false` | NOT NULL |
| `shipping_option_id` | `TEXT NULL` | NULLABLE |
| `data` | `JSONB NULL` | NULLABLE |
| `metadata` | `JSONB NULL` | NULLABLE |
| `created_at` | `TIMESTAMPTZ NOT NULL DEFAULT Now()` | NOT NULL |
| `updated_at` | `TIMESTAMPTZ NOT NULL DEFAULT Now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 33. `order_shipping`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `TEXT NOT NULL` | NOT NULL |
| `order_id` | `TEXT NOT NULL` | NOT NULL |
| `version` | `INTEGER NOT NULL` | NOT NULL |
| `shipping_method_id` | `TEXT NOT NULL` | NOT NULL |
| `return_id` | `TEXT NULL` | NULLABLE |
| `claim_id` | `TEXT NULL` | NULLABLE |
| `exchange_id` | `TEXT NULL` | NULLABLE |
| `created_at` | `TIMESTAMPTZ NOT NULL DEFAULT Now()` | NOT NULL |
| `updated_at` | `TIMESTAMPTZ NOT NULL DEFAULT Now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 34. `order_line_item_tax_line`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `TEXT NOT NULL` | NOT NULL |
| `description` | `TEXT NULL` | NULLABLE |
| `tax_rate_id` | `TEXT NULL` | NULLABLE |
| `code` | `TEXT NOT NULL` | NOT NULL |
| `rate` | `NUMERIC NOT NULL` | NOT NULL |
| `raw_rate` | `JSONB NOT NULL` | NOT NULL |
| `provider_id` | `TEXT NULL` | NULLABLE |
| `created_at` | `TIMESTAMPTZ NOT NULL DEFAULT Now()` | NOT NULL |
| `updated_at` | `TIMESTAMPTZ NOT NULL DEFAULT Now()` | NOT NULL |
| `item_id` | `TEXT NOT NULL` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 35. `order_line_item_adjustment`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `TEXT NOT NULL` | NOT NULL |
| `description` | `TEXT NULL` | NULLABLE |
| `promotion_id` | `TEXT NULL` | NULLABLE |
| `code` | `TEXT NULL` | NULLABLE |
| `amount` | `NUMERIC NOT NULL` | NOT NULL |
| `raw_amount` | `JSONB NOT NULL` | NOT NULL |
| `provider_id` | `TEXT NULL` | NULLABLE |
| `created_at` | `TIMESTAMPTZ NOT NULL DEFAULT Now()` | NOT NULL |
| `updated_at` | `TIMESTAMPTZ NOT NULL DEFAULT Now()` | NOT NULL |
| `item_id` | `TEXT NOT NULL` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 36. `order_shipping_method_adjustment`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `TEXT NOT NULL` | NOT NULL |
| `description` | `TEXT NULL` | NULLABLE |
| `promotion_id` | `TEXT NULL` | NULLABLE |
| `code` | `TEXT NULL` | NULLABLE |
| `amount` | `NUMERIC NOT NULL` | NOT NULL |
| `raw_amount` | `JSONB NOT NULL` | NOT NULL |
| `provider_id` | `TEXT NULL` | NULLABLE |
| `created_at` | `TIMESTAMPTZ NOT NULL DEFAULT Now()` | NOT NULL |
| `updated_at` | `TIMESTAMPTZ NOT NULL DEFAULT Now()` | NOT NULL |
| `shipping_method_id` | `TEXT NOT NULL` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 37. `order_shipping_method_tax_line`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `TEXT NOT NULL` | NOT NULL |
| `description` | `TEXT NULL` | NULLABLE |
| `tax_rate_id` | `TEXT NULL` | NULLABLE |
| `code` | `TEXT NOT NULL` | NOT NULL |
| `rate` | `NUMERIC NOT NULL` | NOT NULL |
| `raw_rate` | `JSONB NOT NULL` | NOT NULL |
| `provider_id` | `TEXT NULL` | NULLABLE |
| `created_at` | `TIMESTAMPTZ NOT NULL DEFAULT Now()` | NOT NULL |
| `updated_at` | `TIMESTAMPTZ NOT NULL DEFAULT Now()` | NOT NULL |
| `shipping_method_id` | `TEXT NOT NULL` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 38. `order_transaction`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `TEXT NOT NULL` | NOT NULL |
| `order_id` | `TEXT NOT NULL` | NOT NULL |
| `version` | `INTEGER NOT NULL DEFAULT 1` | NOT NULL |
| `amount` | `NUMERIC NOT NULL` | NOT NULL |
| `raw_amount` | `JSONB NOT NULL` | NOT NULL |
| `currency_code` | `TEXT NOT NULL` | NOT NULL |
| `reference` | `TEXT NULL` | NULLABLE |
| `reference_id` | `TEXT NULL` | NULLABLE |
| `return_id` | `TEXT NULL` | NULLABLE |
| `claim_id` | `TEXT NULL` | NULLABLE |
| `exchange_id` | `TEXT NULL` | NULLABLE |
| `created_at` | `TIMESTAMPTZ NOT NULL DEFAULT Now()` | NOT NULL |
| `updated_at` | `TIMESTAMPTZ NOT NULL DEFAULT Now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 39. `order_change`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `TEXT NOT NULL` | NOT NULL |
| `order_id` | `TEXT NOT NULL` | NOT NULL |
| `version` | `INTEGER NOT NULL` | NOT NULL |
| `description` | `TEXT NULL` | NULLABLE |
| `change_type` | `text NULL` | NULLABLE |
| `status` | `text check ("status" in ('confirmed','declined','requested','pending','canceled')) NOT NULL DEFAULT 'pending'` | NOT NULL |
| `internal_note` | `text NULL` | NULLABLE |
| `created_by` | `text NULL` | NULLABLE |
| `requested_by` | `text NULL` | NULLABLE |
| `requested_at` | `timestamptz NULL` | NULLABLE |
| `confirmed_by` | `text NULL` | NULLABLE |
| `confirmed_at` | `timestamptz NULL` | NULLABLE |
| `declined_by` | `text NULL` | NULLABLE |
| `declined_reason` | `text NULL` | NULLABLE |
| `metadata` | `jsonb NULL` | NULLABLE |
| `declined_at` | `timestamptz NULL` | NULLABLE |
| `canceled_by` | `text NULL` | NULLABLE |
| `canceled_at` | `timestamptz NULL` | NULLABLE |
| `return_id` | `text NULL` | NULLABLE |
| `claim_id` | `text NULL` | NULLABLE |
| `exchange_id` | `text NULL` | NULLABLE |
| `carry_over_promotions` | `boolean NULL` | NULLABLE |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 40. `order_change_action`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `TEXT NOT NULL` | NOT NULL |
| `order_id` | `TEXT NULL` | NULLABLE |
| `version` | `INTEGER NULL` | NULLABLE |
| `ordering` | `BIGSERIAL NOT NULL` | NOT NULL |
| `order_change_id` | `TEXT NULL` | NULLABLE |
| `reference` | `TEXT NULL` | NULLABLE |
| `reference_id` | `TEXT NULL` | NULLABLE |
| `action` | `TEXT NOT NULL` | NOT NULL |
| `details` | `JSONB NULL` | NULLABLE |
| `amount` | `NUMERIC NULL` | NULLABLE |
| `raw_amount` | `JSONB NULL` | NULLABLE |
| `internal_note` | `TEXT NULL` | NULLABLE |
| `applied` | `BOOLEAN NOT NULL DEFAULT false` | NOT NULL |
| `return_id` | `TEXT NULL` | NULLABLE |
| `claim_id` | `TEXT NULL` | NULLABLE |
| `exchange_id` | `TEXT NULL` | NULLABLE |
| `created_at` | `TIMESTAMPTZ NOT NULL DEFAULT Now()` | NOT NULL |
| `updated_at` | `TIMESTAMPTZ NOT NULL DEFAULT Now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 41. `return_reason`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `value` | `text NOT NULL` | NOT NULL |
| `label` | `text NOT NULL` | NOT NULL |
| `description` | `text NULL` | NULLABLE |
| `metadata` | `JSONB NULL` | NULLABLE |
| `parent_return_reason_id` | `text NULL` | NULLABLE |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 42. `return`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `TEXT NOT NULL, "order_id" TEXT NOT NULL, "claim_id" TEXT NULL, "exchange_id" TEXT NULL` | NOT NULL |
| `order_version` | `INTEGER NOT NULL, "display_id" SERIAL` | NOT NULL |
| `status` | `return_status_enum NOT NULL DEFAULT 'requested'` | NOT NULL |
| `no_notification` | `boolean NULL, "refund_amount" NUMERIC NULL, "raw_refund_amount" JSONB NULL` | NULLABLE |
| `created_by` | `text NULL` | NULLABLE |
| `metadata` | `jsonb NULL` | NULLABLE |
| `created_at` | `timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL, "received_at" timestamptz NULL, "canceled_at" timestamptz NULL` | NULLABLE |

### 43. `return_item`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `TEXT NOT NULL, "return_id" TEXT NOT NULL, "reason_id" TEXT NULL, "item_id" TEXT NOT NULL` | NOT NULL |
| `quantity` | `NUMERIC NOT NULL, "raw_quantity" JSONB NOT NULL` | NOT NULL |
| `received_quantity` | `NUMERIC NOT NULL DEFAULT 0, "raw_received_quantity" JSONB NOT NULL` | NOT NULL |
| `damaged_quantity` | `numeric NOT NULL DEFAULT 0, "raw_damaged_quantity" jsonb NULL` | NOT NULL |
| `note` | `TEXT NULL, "metadata" JSONB NULL` | NULLABLE |
| `created_at` | `timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 44. `order_exchange`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `TEXT NOT NULL, "order_id" TEXT NOT NULL, "return_id" TEXT NULL` | NOT NULL |
| `order_version` | `INTEGER NOT NULL, "display_id" SERIAL` | NOT NULL |
| `no_notification` | `BOOLEAN NULL, "allow_backorder" BOOLEAN NOT NULL DEFAULT FALSE` | NOT NULL |
| `difference_due` | `NUMERIC NULL, "raw_difference_due" JSONB NULL` | NULLABLE |
| `created_by` | `text NULL, "metadata" JSONB NULL` | NULLABLE |
| `created_at` | `timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL, "canceled_at" timestamptz NULL` | NULLABLE |

### 45. `order_exchange_item`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `TEXT NOT NULL, "exchange_id" TEXT NOT NULL, "item_id" TEXT NOT NULL` | NOT NULL |
| `quantity` | `NUMERIC NOT NULL, "raw_quantity" JSONB NOT NULL` | NOT NULL |
| `note` | `TEXT NULL, "metadata" JSONB NULL` | NULLABLE |
| `created_at` | `timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 46. `order_claim`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `TEXT NOT NULL, "order_id" TEXT NOT NULL, "return_id" TEXT NULL` | NOT NULL |
| `order_version` | `INTEGER NOT NULL, "display_id" SERIAL` | NOT NULL |
| `type` | `order_claim_type_enum NOT NULL` | NOT NULL |
| `no_notification` | `BOOLEAN NULL, "refund_amount" NUMERIC NULL, "raw_refund_amount" JSONB NULL` | NULLABLE |
| `created_by` | `text NULL, "metadata" JSONB NULL` | NULLABLE |
| `created_at` | `timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL, "canceled_at" timestamptz NULL` | NULLABLE |

### 47. `order_claim_item`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `TEXT NOT NULL, "claim_id" TEXT NOT NULL, "item_id" TEXT NOT NULL` | NOT NULL |
| `is_additional_item` | `BOOLEAN NOT NULL DEFAULT FALSE` | NOT NULL |
| `reason` | `claim_reason_enum NULL` | NULLABLE |
| `quantity` | `NUMERIC NOT NULL, "raw_quantity" JSONB NOT NULL` | NOT NULL |
| `note` | `TEXT NULL, "metadata" JSONB NULL` | NULLABLE |
| `created_at` | `timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 48. `order_claim_item_image`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `TEXT NOT NULL, "claim_item_id" TEXT NOT NULL, "url" TEXT NOT NULL, "metadata" JSONB NULL` | NOT NULL |
| `created_at` | `timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 49. `order_credit_line`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL, "order_id" text NOT NULL, "reference" text NULL, "reference_id" text NULL` | NOT NULL |
| `amount` | `numeric NOT NULL, "raw_amount" jsonb NOT NULL, "metadata" jsonb NULL` | NOT NULL |
| `created_at` | `timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

## 05 Payment
### 50. `payment_collection`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `TEXT NOT NULL` | NOT NULL |
| `currency_code` | `TEXT NOT NULL` | NOT NULL |
| `amount` | `NUMERIC NOT NULL` | NOT NULL |
| `raw_amount` | `JSONB NOT NULL` | NOT NULL |
| `authorized_amount` | `NUMERIC NULL` | NULLABLE |
| `raw_authorized_amount` | `JSONB NULL` | NULLABLE |
| `captured_amount` | `NUMERIC NULL` | NULLABLE |
| `raw_captured_amount` | `JSONB NULL` | NULLABLE |
| `refunded_amount` | `NUMERIC NULL` | NULLABLE |
| `raw_refunded_amount` | `JSONB NULL` | NULLABLE |
| `region_id` | `TEXT NOT NULL` | NOT NULL |
| `created_at` | `TIMESTAMPTZ NOT NULL DEFAULT NOW()` | NOT NULL |
| `updated_at` | `TIMESTAMPTZ NOT NULL DEFAULT NOW()` | NOT NULL |
| `deleted_at` | `TIMESTAMPTZ NULL` | NULLABLE |
| `completed_at` | `TIMESTAMPTZ NULL` | NULLABLE |
| `status` | `TEXT CHECK ("status" IN ('not_paid','awaiting','authorized','partially_authorized','canceled')) NOT NULL DEFAULT 'not_paid'` | NOT NULL |
| `metadata` | `JSONB NULL` | NULLABLE |

### 51. `payment_provider`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `TEXT NOT NULL` | NOT NULL |
| `is_enabled` | `BOOLEAN NOT NULL DEFAULT TRUE` | NOT NULL |

### 52. `account_holder`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `provider_id` | `text NOT NULL` | NOT NULL |
| `external_id` | `text NOT NULL` | NOT NULL |
| `email` | `text NULL` | NULLABLE |
| `data` | `jsonb NOT NULL DEFAULT '{}'::jsonb` | NOT NULL |
| `metadata` | `jsonb NULL` | NULLABLE |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 53. `payment_collection_payment_providers`
| Column | Type / Definition | Nullability |
|---|---|---|
| `payment_collection_id` | `TEXT NOT NULL` | NOT NULL |
| `payment_provider_id` | `TEXT NOT NULL` | NOT NULL |

### 54. `payment_session`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `TEXT NOT NULL` | NOT NULL |
| `currency_code` | `TEXT NOT NULL` | NOT NULL |
| `amount` | `NUMERIC NOT NULL` | NOT NULL |
| `raw_amount` | `JSONB NOT NULL` | NOT NULL |
| `provider_id` | `TEXT NOT NULL` | NOT NULL |
| `data` | `JSONB NOT NULL` | NOT NULL |
| `context` | `JSONB NULL` | NULLABLE |
| `status` | `TEXT CHECK ("status" IN ('authorized','pending','requires_more','error','canceled')) NOT NULL DEFAULT 'pending'` | NOT NULL |
| `authorized_at` | `TIMESTAMPTZ NULL` | NULLABLE |
| `payment_collection_id` | `TEXT NOT NULL` | NOT NULL |
| `metadata` | `JSONB NULL` | NULLABLE |
| `created_at` | `TIMESTAMPTZ NOT NULL DEFAULT NOW()` | NOT NULL |
| `updated_at` | `TIMESTAMPTZ NOT NULL DEFAULT NOW()` | NOT NULL |
| `deleted_at` | `TIMESTAMPTZ NULL` | NULLABLE |

### 55. `payment`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `TEXT NOT NULL` | NOT NULL |
| `amount` | `NUMERIC NOT NULL` | NOT NULL |
| `raw_amount` | `JSONB NOT NULL` | NOT NULL |
| `currency_code` | `TEXT NOT NULL` | NOT NULL |
| `provider_id` | `TEXT NOT NULL` | NOT NULL |
| `cart_id` | `TEXT NULL` | NULLABLE |
| `order_id` | `TEXT NULL` | NULLABLE |
| `customer_id` | `TEXT NULL` | NULLABLE |
| `data` | `JSONB NULL` | NULLABLE |
| `created_at` | `TIMESTAMPTZ NOT NULL DEFAULT NOW()` | NOT NULL |
| `updated_at` | `TIMESTAMPTZ NOT NULL DEFAULT NOW()` | NOT NULL |
| `deleted_at` | `TIMESTAMPTZ NULL` | NULLABLE |
| `captured_at` | `TIMESTAMPTZ NULL` | NULLABLE |
| `canceled_at` | `TIMESTAMPTZ NULL` | NULLABLE |
| `payment_collection_id` | `TEXT NOT NULL` | NOT NULL |
| `payment_session_id` | `TEXT NOT NULL` | NOT NULL |
| `metadata` | `JSONB NULL` | NULLABLE |

### 56. `refund_reason`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `label` | `text NOT NULL` | NOT NULL |
| `description` | `text NULL` | NULLABLE |
| `metadata` | `jsonb NULL` | NULLABLE |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 57. `refund`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `TEXT NOT NULL` | NOT NULL |
| `amount` | `NUMERIC NOT NULL` | NOT NULL |
| `raw_amount` | `JSONB NOT NULL` | NOT NULL |
| `payment_id` | `TEXT NOT NULL` | NOT NULL |
| `refund_reason_id` | `TEXT NULL` | NULLABLE |
| `note` | `TEXT NULL` | NULLABLE |
| `created_at` | `TIMESTAMPTZ NOT NULL DEFAULT NOW()` | NOT NULL |
| `updated_at` | `TIMESTAMPTZ NOT NULL DEFAULT NOW()` | NOT NULL |
| `deleted_at` | `TIMESTAMPTZ NULL` | NULLABLE |
| `created_by` | `TEXT NULL` | NULLABLE |
| `metadata` | `JSONB NULL` | NULLABLE |

### 58. `capture`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `TEXT NOT NULL` | NOT NULL |
| `amount` | `NUMERIC NOT NULL` | NOT NULL |
| `raw_amount` | `JSONB NOT NULL` | NOT NULL |
| `payment_id` | `TEXT NOT NULL` | NOT NULL |
| `created_at` | `TIMESTAMPTZ NOT NULL DEFAULT NOW()` | NOT NULL |
| `updated_at` | `TIMESTAMPTZ NOT NULL DEFAULT NOW()` | NOT NULL |
| `deleted_at` | `TIMESTAMPTZ NULL` | NULLABLE |
| `created_by` | `TEXT NULL` | NULLABLE |
| `metadata` | `JSONB NULL` | NULLABLE |

## 06 Pricing
### 59. `price_set`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 60. `rule_type`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `name` | `text NOT NULL` | NOT NULL |
| `rule_attribute` | `text NOT NULL` | NOT NULL |
| `default_priority` | `integer NOT NULL DEFAULT 0` | NOT NULL |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 61. `price`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `title` | `text` | NULLABLE |
| `price_set_id` | `text NOT NULL` | NOT NULL |
| `currency_code` | `text NOT NULL` | NOT NULL |
| `raw_amount` | `jsonb NOT NULL` | NOT NULL |
| `rules_count` | `integer NOT NULL DEFAULT 0` | NOT NULL |
| `amount` | `numeric NOT NULL` | NOT NULL |
| `min_quantity` | `numeric NULL` | NULLABLE |
| `max_quantity` | `numeric NULL` | NULLABLE |
| `raw_min_quantity` | `jsonb NULL` | NULLABLE |
| `raw_max_quantity` | `jsonb NULL` | NULLABLE |
| `price_list_id` | `text NULL` | NULLABLE |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 62. `price_set_rule_type`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `price_set_id` | `text NOT NULL` | NOT NULL |
| `rule_type_id` | `text NOT NULL` | NOT NULL |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 63. `price_rule`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `price_set_id` | `text NOT NULL` | NOT NULL |
| `rule_type_id` | `text NOT NULL` | NOT NULL |
| `value` | `text NOT NULL` | NOT NULL |
| `attribute` | `text NOT NULL DEFAULT ''` | NOT NULL |
| `operator` | `text CHECK ("operator" IN ('gte','lte','gt','lt','eq')) NULL` | NULLABLE |
| `priority` | `integer NOT NULL DEFAULT 0` | NOT NULL |
| `price_id` | `text NOT NULL` | NOT NULL |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 64. `price_list`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `status` | `text CHECK ("status" IN ('active','draft')) NOT NULL DEFAULT 'draft'` | NOT NULL |
| `starts_at` | `timestamptz NULL` | NULLABLE |
| `ends_at` | `timestamptz NULL` | NULLABLE |
| `rules_count` | `integer NOT NULL DEFAULT 0` | NOT NULL |
| `title` | `text NOT NULL` | NOT NULL |
| `description` | `text NOT NULL` | NOT NULL |
| `type` | `text CHECK ("type" IN ('sale','override')) NOT NULL DEFAULT 'sale'` | NOT NULL |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 65. `price_list_rule`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `rule_type_id` | `text NOT NULL` | NOT NULL |
| `price_list_id` | `text NOT NULL` | NOT NULL |
| `attribute` | `text NOT NULL DEFAULT ''` | NOT NULL |
| `value` | `jsonb NULL` | NULLABLE |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 66. `price_list_rule_value`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `value` | `text NOT NULL` | NOT NULL |
| `price_list_rule_id` | `text NOT NULL` | NOT NULL |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 67. `price_preference`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `attribute` | `text NOT NULL` | NOT NULL |
| `value` | `text NULL` | NULLABLE |
| `is_tax_inclusive` | `boolean NOT NULL DEFAULT false` | NOT NULL |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

## 07 Promotion
### 68. `promotion_campaign`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `name` | `text NOT NULL` | NOT NULL |
| `description` | `text NULL` | NULLABLE |
| `campaign_identifier` | `text NOT NULL` | NOT NULL |
| `starts_at` | `timestamptz NULL` | NULLABLE |
| `ends_at` | `timestamptz NULL` | NULLABLE |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 69. `promotion_campaign_budget`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `type` | `text CHECK ("type" IN ('spend','usage','use_by_attribute','spend_by_attribute')) NOT NULL` | NOT NULL |
| `campaign_id` | `text NOT NULL` | NOT NULL |
| `limit` | `numeric NULL` | NULLABLE |
| `raw_limit` | `jsonb NULL` | NULLABLE |
| `used` | `numeric NOT NULL DEFAULT 0` | NOT NULL |
| `raw_used` | `jsonb NOT NULL` | NOT NULL |
| `currency_code` | `text NULL` | NULLABLE |
| `attribute` | `text NULL` | NULLABLE |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 70. `promotion_campaign_budget_usage`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `attribute_value` | `text NOT NULL` | NOT NULL |
| `used` | `numeric NOT NULL DEFAULT 0` | NOT NULL |
| `budget_id` | `text NOT NULL` | NOT NULL |
| `raw_used` | `jsonb NOT NULL` | NOT NULL |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 71. `promotion`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `code` | `text NOT NULL` | NOT NULL |
| `campaign_id` | `text NULL` | NULLABLE |
| `is_automatic` | `boolean NOT NULL DEFAULT false` | NOT NULL |
| `type` | `text CHECK ("type" IN ('standard','buyget')) NOT NULL` | NOT NULL |
| `status` | `text CHECK ("status" IN ('draft','active','inactive')) NOT NULL DEFAULT 'draft'` | NOT NULL |
| `is_tax_inclusive` | `boolean NOT NULL DEFAULT false` | NOT NULL |
| `limit` | `integer NULL` | NULLABLE |
| `used` | `integer NOT NULL DEFAULT 0` | NOT NULL |
| `metadata` | `jsonb NULL` | NULLABLE |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 72. `promotion_application_method`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `value` | `numeric NULL` | NULLABLE |
| `raw_value` | `jsonb NOT NULL` | NOT NULL |
| `max_quantity` | `numeric NULL` | NULLABLE |
| `apply_to_quantity` | `numeric NULL` | NULLABLE |
| `buy_rules_min_quantity` | `numeric NULL` | NULLABLE |
| `type` | `text CHECK ("type" IN ('fixed','percentage')) NOT NULL` | NOT NULL |
| `target_type` | `text CHECK ("target_type" IN ('order','shipping_methods','items')) NOT NULL` | NOT NULL |
| `allocation` | `text CHECK ("allocation" IN ('each','across')) NULL` | NULLABLE |
| `promotion_id` | `text NOT NULL` | NOT NULL |
| `currency_code` | `text NOT NULL` | NOT NULL |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 73. `promotion_rule`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `description` | `text NULL` | NULLABLE |
| `attribute` | `text NOT NULL` | NOT NULL |
| `operator` | `text CHECK ("operator" IN ('gte','lte','gt','lt','eq','ne','in')) NOT NULL` | NOT NULL |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 74. `promotion_rule_value`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `promotion_rule_id` | `text NOT NULL` | NOT NULL |
| `value` | `text NOT NULL` | NOT NULL |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 75. `promotion_promotion_rule`
| Column | Type / Definition | Nullability |
|---|---|---|
| `promotion_id` | `text NOT NULL` | NOT NULL |
| `promotion_rule_id` | `text NOT NULL` | NOT NULL |

### 76. `application_method_target_rules`
| Column | Type / Definition | Nullability |
|---|---|---|
| `application_method_id` | `text NOT NULL` | NOT NULL |
| `promotion_rule_id` | `text NOT NULL` | NOT NULL |

### 77. `application_method_buy_rules`
| Column | Type / Definition | Nullability |
|---|---|---|
| `application_method_id` | `text NOT NULL` | NOT NULL |
| `promotion_rule_id` | `text NOT NULL` | NOT NULL |

## 08 Fulfillment
### 78. `fulfillment_address`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL, "company" text NULL, "first_name" text NULL, "last_name" text NULL` | NOT NULL |
| `address_1` | `text NULL, "address_2" text NULL, "city" text NULL, "country_code" text NULL` | NULLABLE |
| `province` | `text NULL, "postal_code" text NULL, "phone" text NULL, "metadata" jsonb NULL` | NULLABLE |
| `created_at` | `timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 79. `fulfillment_provider`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL, "is_enabled" boolean NOT NULL DEFAULT true` | NOT NULL |
| `created_at` | `timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 80. `fulfillment_set`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL, "name" text NOT NULL, "type" text NOT NULL, "metadata" jsonb NULL` | NOT NULL |
| `created_at` | `timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 81. `service_zone`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL, "name" text NOT NULL, "metadata" jsonb NULL, "fulfillment_set_id" text NOT NULL` | NOT NULL |
| `created_at` | `timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 82. `geo_zone`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `type` | `text CHECK ("type" IN ('country','province','city','zip')) NOT NULL DEFAULT 'country'` | NOT NULL |
| `country_code` | `text NOT NULL, "province_code" text NULL, "city" text NULL` | NOT NULL |
| `service_zone_id` | `text NOT NULL, "postal_expression" jsonb NULL, "metadata" jsonb NULL` | NOT NULL |
| `created_at` | `timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 83. `shipping_option_type`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL, "label" text NOT NULL, "description" text NULL, "code" text NOT NULL` | NOT NULL |
| `created_at` | `timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 84. `shipping_profile`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL, "name" text NOT NULL, "type" text NOT NULL, "metadata" jsonb NULL` | NOT NULL |
| `created_at` | `timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 85. `shipping_option`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL, "name" text NOT NULL` | NOT NULL |
| `price_type` | `text CHECK ("price_type" IN ('calculated','flat')) NOT NULL DEFAULT 'flat'` | NOT NULL |
| `service_zone_id` | `text NOT NULL, "shipping_profile_id" text NULL, "provider_id" text NULL` | NOT NULL |
| `data` | `jsonb NULL, "metadata" jsonb NULL, "shipping_option_type_id" text NOT NULL` | NOT NULL |
| `created_at` | `timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 86. `shipping_option_rule`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL, "attribute" text NOT NULL` | NOT NULL |
| `operator` | `text CHECK ("operator" IN ('in','eq','ne','gt','gte','lt','lte','nin')) NOT NULL` | NOT NULL |
| `value` | `jsonb NULL, "shipping_option_id" text NOT NULL` | NOT NULL |
| `created_at` | `timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 87. `fulfillment`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL, "location_id" text NOT NULL, "packed_at" timestamptz NULL` | NOT NULL |
| `shipped_at` | `timestamptz NULL, "delivered_at" timestamptz NULL, "canceled_at" timestamptz NULL` | NULLABLE |
| `data` | `jsonb NULL, "provider_id" text NULL, "shipping_option_id" text NULL` | NULLABLE |
| `marked_shipped_by` | `text NULL, "created_by" text NULL` | NULLABLE |
| `requires_shipping` | `boolean NOT NULL DEFAULT true` | NOT NULL |
| `metadata` | `jsonb NULL, "delivery_address_id" text NULL` | NULLABLE |
| `created_at` | `timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 88. `fulfillment_label`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL, "tracking_number" text NOT NULL, "tracking_url" text NOT NULL` | NOT NULL |
| `label_url` | `text NOT NULL, "fulfillment_id" text NOT NULL` | NOT NULL |
| `created_at` | `timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 89. `fulfillment_item`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL, "title" text NOT NULL, "sku" text NOT NULL, "barcode" text NOT NULL` | NOT NULL |
| `quantity` | `numeric NOT NULL, "raw_quantity" jsonb NOT NULL` | NOT NULL |
| `line_item_id` | `text NULL, "inventory_item_id" text NULL, "fulfillment_id" text NOT NULL` | NOT NULL |
| `created_at` | `timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

## 09 Inventory
### 90. `inventory_item`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL, "sku" text NULL, "origin_country" text NULL, "hs_code" text NULL` | NULLABLE |
| `mid_code` | `text NULL, "material" text NULL, "weight" int NULL, "length" int NULL, "height" int NULL` | NULLABLE |
| `width` | `int NULL, "requires_shipping" boolean NOT NULL DEFAULT true, "description" text NULL` | NOT NULL |
| `title` | `text NULL, "thumbnail" text NULL, "metadata" jsonb NULL` | NULLABLE |

### 91. `inventory_level`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL, "inventory_item_id" text NOT NULL, "location_id" text NOT NULL` | NOT NULL |
| `stocked_quantity` | `int NOT NULL DEFAULT 0, "reserved_quantity" int NOT NULL DEFAULT 0` | NOT NULL |
| `incoming_quantity` | `int NOT NULL DEFAULT 0` | NOT NULL |
| `raw_stocked_quantity` | `jsonb NOT NULL, "raw_reserved_quantity" jsonb NOT NULL, "raw_incoming_quantity" jsonb NOT NULL` | NOT NULL |
| `metadata` | `jsonb NULL` | NULLABLE |

### 92. `reservation_item`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL, "line_item_id" text NULL, "location_id" text NOT NULL` | NOT NULL |
| `quantity` | `integer NOT NULL, "raw_quantity" jsonb NOT NULL, "external_id" text NULL, "description" text NULL` | NOT NULL |
| `created_by` | `text NULL, "metadata" jsonb NULL, "inventory_item_id" text NOT NULL` | NOT NULL |
| `allow_backorder` | `boolean NOT NULL DEFAULT false` | NOT NULL |

## 10 Region
### 93. `region`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL, "name" text NOT NULL, "currency_code" text NOT NULL` | NOT NULL |
| `automatic_taxes` | `BOOLEAN NOT NULL DEFAULT TRUE` | NOT NULL |
| `metadata` | `jsonb NULL` | NULLABLE |
| `created_at` | `timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 94. `region_country`
| Column | Type / Definition | Nullability |
|---|---|---|
| `iso_2` | `text NOT NULL, "iso_3" text NOT NULL, "num_code" text NOT NULL` | NOT NULL |
| `name` | `text NOT NULL, "display_name" text NOT NULL, "region_id" text NULL` | NOT NULL |

## 11 Tax
### 95. `tax_provider`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL, "is_enabled" boolean NOT NULL DEFAULT true` | NOT NULL |
| `created_at` | `timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 96. `tax_region`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL, "provider_id" text NULL, "country_code" text NOT NULL` | NOT NULL |
| `province_code` | `text NULL, "parent_id" text NULL, "metadata" jsonb NULL` | NULLABLE |
| `created_at` | `timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `created_by` | `text NULL, "deleted_at" timestamptz NULL` | NULLABLE |

### 97. `tax_rate`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL, "rate" real NULL, "code" text NULL, "name" text NOT NULL` | NOT NULL |
| `is_default` | `bool NOT NULL DEFAULT false, "is_combinable" bool NOT NULL DEFAULT false` | NOT NULL |
| `tax_region_id` | `text NOT NULL, "metadata" jsonb NULL` | NOT NULL |
| `created_at` | `timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `created_by` | `text NULL, "deleted_at" timestamptz NULL` | NULLABLE |

### 98. `tax_rate_rule`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL, "tax_rate_id" text NOT NULL, "reference_id" text NOT NULL` | NOT NULL |
| `reference` | `text NOT NULL, "metadata" jsonb NULL` | NOT NULL |
| `created_at` | `timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `created_by` | `text NULL, "deleted_at" timestamptz NULL` | NULLABLE |

## 12 Store
### 99. `store`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `name` | `text NOT NULL DEFAULT 'Medusa Store'` | NOT NULL |
| `default_sales_channel_id` | `text NULL` | NULLABLE |
| `default_region_id` | `text NULL` | NULLABLE |
| `default_location_id` | `text NULL` | NULLABLE |
| `metadata` | `jsonb NULL` | NULLABLE |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 100. `store_currency`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `currency_code` | `text NOT NULL` | NOT NULL |
| `is_default` | `boolean NOT NULL DEFAULT false` | NOT NULL |
| `store_id` | `text NULL` | NULLABLE |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 101. `store_locale`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `locale_code` | `text NOT NULL` | NOT NULL |
| `is_default` | `boolean NOT NULL DEFAULT false` | NOT NULL |
| `store_id` | `text NULL` | NULLABLE |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

## 13 Sales Channel
### 102. `sales_channel`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `name` | `text NOT NULL` | NOT NULL |
| `description` | `text NULL` | NULLABLE |
| `is_disabled` | `boolean NOT NULL DEFAULT false` | NOT NULL |
| `metadata` | `jsonb NULL` | NULLABLE |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

## 14 User & Auth
### 103. `user`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `first_name` | `text NULL` | NULLABLE |
| `last_name` | `text NULL` | NULLABLE |
| `email` | `text NOT NULL` | NOT NULL |
| `avatar_url` | `text NULL` | NULLABLE |
| `metadata` | `jsonb NULL` | NULLABLE |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 104. `invite`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `email` | `text NOT NULL` | NOT NULL |
| `accepted` | `boolean NOT NULL DEFAULT false` | NOT NULL |
| `token` | `text NOT NULL` | NOT NULL |
| `expires_at` | `timestamptz NOT NULL` | NOT NULL |
| `metadata` | `jsonb NULL` | NULLABLE |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 105. `auth_identity`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `app_metadata` | `jsonb NULL` | NULLABLE |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |

### 106. `provider_identity`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `entity_id` | `text NOT NULL` | NOT NULL |
| `provider` | `text NOT NULL` | NOT NULL |
| `auth_identity_id` | `text NOT NULL` | NOT NULL |
| `user_metadata` | `jsonb NULL` | NULLABLE |
| `provider_metadata` | `jsonb NULL` | NULLABLE |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |

## 15 API Key
### 107. `api_key`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `token` | `text NOT NULL` | NOT NULL |
| `salt` | `text NOT NULL` | NOT NULL |
| `redacted` | `text NOT NULL` | NOT NULL |
| `title` | `text NOT NULL` | NOT NULL |
| `type` | `text CHECK ("type" IN ('publishable','secret')) NOT NULL` | NOT NULL |
| `last_used_at` | `timestamptz NULL` | NULLABLE |
| `created_by` | `text NOT NULL` | NOT NULL |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `revoked_by` | `text NULL` | NULLABLE |
| `revoked_at` | `timestamptz NULL` | NULLABLE |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |

## 16 Currency
### 108. `currency`
| Column | Type / Definition | Nullability |
|---|---|---|
| `code` | `text NOT NULL` | NOT NULL |
| `symbol` | `text NOT NULL` | NOT NULL |
| `symbol_native` | `text NOT NULL` | NOT NULL |
| `name` | `text NOT NULL` | NOT NULL |
| `decimal_digits` | `integer NOT NULL DEFAULT 0` | NOT NULL |
| `rounding` | `numeric NOT NULL DEFAULT 0` | NOT NULL |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

## 17 Stock Location
### 109. `stock_location_address`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |
| `address_1` | `text NOT NULL` | NOT NULL |
| `address_2` | `text NULL` | NULLABLE |
| `company` | `text NULL` | NULLABLE |
| `city` | `text NULL` | NULLABLE |
| `country_code` | `text NOT NULL` | NOT NULL |
| `phone` | `text NULL` | NULLABLE |
| `province` | `text NULL` | NULLABLE |
| `postal_code` | `text NULL` | NULLABLE |
| `metadata` | `jsonb NULL` | NULLABLE |

### 110. `stock_location`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |
| `name` | `text NOT NULL` | NOT NULL |
| `address_id` | `text NULL` | NULLABLE |
| `metadata` | `jsonb NULL` | NULLABLE |

## 18 Notification
### 111. `notification_provider`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `handle` | `text NOT NULL` | NOT NULL |
| `name` | `text NOT NULL` | NOT NULL |
| `is_enabled` | `boolean NOT NULL DEFAULT true` | NOT NULL |
| `channels` | `text[] NOT NULL` | NOT NULL |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 112. `notification`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `to` | `text NOT NULL` | NOT NULL |
| `channel` | `text NOT NULL` | NOT NULL |
| `template` | `text NOT NULL` | NOT NULL |
| `data` | `jsonb NULL` | NULLABLE |
| `trigger_type` | `text NULL` | NULLABLE |
| `resource_id` | `text NULL` | NULLABLE |
| `resource_type` | `text NULL` | NULLABLE |
| `receiver_id` | `text NULL` | NULLABLE |
| `original_notification_id` | `text NULL` | NULLABLE |
| `idempotency_key` | `text NULL` | NULLABLE |
| `external_id` | `text NULL` | NULLABLE |
| `provider_id` | `text NULL` | NULLABLE |
| `status` | `text CHECK ("status" IN ('pending','success','failure')) NOT NULL DEFAULT 'pending'` | NOT NULL |
| `from` | `text NULL` | NULLABLE |
| `provider_data` | `jsonb NULL` | NULLABLE |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

## 19 RBAC
### 113. `rbac_policy`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL, "key" text NOT NULL, "resource" text NOT NULL, "operation" text NOT NULL` | NOT NULL |
| `name` | `text NULL, "description" text NULL, "metadata" jsonb NULL` | NULLABLE |
| `created_at` | `timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 114. `rbac_role`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL, "name" text NOT NULL, "description" text NULL, "metadata" jsonb NULL` | NOT NULL |
| `created_at` | `timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 115. `rbac_role_parent`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL, "role_id" text NOT NULL, "parent_id" text NOT NULL, "metadata" jsonb NULL` | NOT NULL |
| `created_at` | `timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 116. `rbac_role_policy`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL, "role_id" text NOT NULL, "policy_id" text NOT NULL, "metadata" jsonb NULL` | NOT NULL |
| `created_at` | `timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

## 20 Settings
### 117. `user_preference`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `user_id` | `text NOT NULL` | NOT NULL |
| `key` | `text NOT NULL` | NOT NULL |
| `value` | `jsonb NOT NULL` | NOT NULL |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 118. `view_configuration`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `entity` | `text NOT NULL` | NOT NULL |
| `name` | `text NULL` | NULLABLE |
| `user_id` | `text NULL` | NULLABLE |
| `is_system_default` | `boolean NOT NULL DEFAULT false` | NOT NULL |
| `configuration` | `jsonb NOT NULL` | NOT NULL |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

## 21 Link Modules
### 119. `link_module_migrations`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `SERIAL PRIMARY KEY` | NULLABLE |
| `table_name` | `VARCHAR(255) NOT NULL UNIQUE` | NOT NULL |
| `link_descriptor` | `JSONB NOT NULL DEFAULT '{}'::jsonb` | NOT NULL |
| `created_at` | `TIMESTAMP DEFAULT CURRENT_TIMESTAMP` | NULLABLE |

### 120. `cart_payment_collection`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `cart_id` | `text NOT NULL` | NOT NULL |
| `payment_collection_id` | `text NOT NULL` | NOT NULL |
| `created_at` | `timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 121. `cart_promotion`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `cart_id` | `text NOT NULL` | NOT NULL |
| `promotion_id` | `text NOT NULL` | NOT NULL |
| `created_at` | `timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 122. `customer_account_holder`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `customer_id` | `text NOT NULL` | NOT NULL |
| `account_holder_id` | `text NOT NULL` | NOT NULL |
| `created_at` | `timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 123. `location_fulfillment_provider`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `stock_location_id` | `text NOT NULL` | NOT NULL |
| `fulfillment_provider_id` | `text NOT NULL` | NOT NULL |
| `created_at` | `timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 124. `location_fulfillment_set`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `stock_location_id` | `text NOT NULL` | NOT NULL |
| `fulfillment_set_id` | `text NOT NULL` | NOT NULL |
| `created_at` | `timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 125. `invite_rbac_role`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `invite_id` | `text NOT NULL` | NOT NULL |
| `rbac_role_id` | `text NOT NULL` | NOT NULL |
| `created_at` | `timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 126. `order_cart`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `order_id` | `text NOT NULL` | NOT NULL |
| `cart_id` | `text NOT NULL` | NOT NULL |
| `created_at` | `timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 127. `order_claim_payment_collection`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `claim_id` | `text NOT NULL` | NOT NULL |
| `payment_collection_id` | `text NOT NULL` | NOT NULL |
| `created_at` | `timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 128. `order_exchange_payment_collection`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `exchange_id` | `text NOT NULL` | NOT NULL |
| `payment_collection_id` | `text NOT NULL` | NOT NULL |
| `created_at` | `timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 129. `order_fulfillment`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `order_id` | `text NOT NULL` | NOT NULL |
| `fulfillment_id` | `text NOT NULL` | NOT NULL |
| `created_at` | `timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 130. `order_payment_collection`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `order_id` | `text NOT NULL` | NOT NULL |
| `payment_collection_id` | `text NOT NULL` | NOT NULL |
| `created_at` | `timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 131. `order_promotion`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `order_id` | `text NOT NULL` | NOT NULL |
| `promotion_id` | `text NOT NULL` | NOT NULL |
| `created_at` | `timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 132. `return_fulfillment`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `return_id` | `text NOT NULL` | NOT NULL |
| `fulfillment_id` | `text NOT NULL` | NOT NULL |
| `created_at` | `timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 133. `product_sales_channel`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `product_id` | `text NOT NULL` | NOT NULL |
| `sales_channel_id` | `text NOT NULL` | NOT NULL |
| `created_at` | `timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 134. `product_shipping_profile`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `product_id` | `text NOT NULL` | NOT NULL |
| `shipping_profile_id` | `text NOT NULL` | NOT NULL |
| `created_at` | `timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 135. `product_variant_inventory_item`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `variant_id` | `text NOT NULL` | NOT NULL |
| `inventory_item_id` | `text NOT NULL` | NOT NULL |
| `required_quantity` | `integer NOT NULL DEFAULT 1` | NOT NULL |
| `created_at` | `timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 136. `product_variant_price_set`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `variant_id` | `text NOT NULL` | NOT NULL |
| `price_set_id` | `text NOT NULL` | NOT NULL |
| `created_at` | `timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 137. `publishable_api_key_sales_channel`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `publishable_key_id` | `text NOT NULL` | NOT NULL |
| `sales_channel_id` | `text NOT NULL` | NOT NULL |
| `created_at` | `timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 138. `region_payment_provider`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `region_id` | `text NOT NULL` | NOT NULL |
| `payment_provider_id` | `text NOT NULL` | NOT NULL |
| `created_at` | `timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 139. `sales_channel_stock_location`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `sales_channel_id` | `text NOT NULL` | NOT NULL |
| `stock_location_id` | `text NOT NULL` | NOT NULL |
| `created_at` | `timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 140. `shipping_option_price_set`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `shipping_option_id` | `text NOT NULL` | NOT NULL |
| `price_set_id` | `text NOT NULL` | NOT NULL |
| `created_at` | `timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 141. `user_rbac_role`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `user_id` | `text NOT NULL` | NOT NULL |
| `rbac_role_id` | `text NOT NULL` | NOT NULL |
| `created_at` | `timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

## 22 Workflow
### 142. `workflow_execution`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `character varying NOT NULL` | NOT NULL |
| `workflow_id` | `character varying NOT NULL` | NOT NULL |
| `transaction_id` | `character varying NOT NULL` | NOT NULL |
| `execution` | `jsonb NULL` | NULLABLE |
| `context` | `jsonb NULL` | NULLABLE |
| `state` | `text NOT NULL` | NOT NULL |
| `retention_time` | `integer NULL` | NULLABLE |
| `run_id` | `text NOT NULL` | NOT NULL |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

## 23 Index
### 143. `index_data`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `name` | `text NOT NULL` | NOT NULL |
| `data` | `jsonb NOT NULL DEFAULT '{}'` | NOT NULL |

### 144. `index_relation`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `bigserial` | NULLABLE |
| `pivot` | `text NOT NULL` | NOT NULL |
| `parent_id` | `text NOT NULL` | NOT NULL |
| `parent_name` | `text NOT NULL` | NOT NULL |
| `child_id` | `text NOT NULL` | NOT NULL |
| `child_name` | `text NOT NULL` | NOT NULL |

### 145. `index_metadata`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `entity` | `text NOT NULL` | NOT NULL |
| `fields` | `text NOT NULL` | NOT NULL |
| `fields_hash` | `text NOT NULL` | NOT NULL |
| `status` | `text CHECK ("status" IN ('pending','processing','done','error')) NOT NULL DEFAULT 'pending'` | NOT NULL |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 146. `index_sync`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `entity` | `text NOT NULL` | NOT NULL |
| `last_key` | `text NULL` | NULLABLE |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

## 24 Translation
### 147. `locale`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `code` | `text NOT NULL` | NOT NULL |
| `name` | `text NOT NULL` | NOT NULL |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 148. `translation`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `reference_id` | `text NOT NULL` | NOT NULL |
| `reference` | `text NOT NULL` | NOT NULL |
| `locale_code` | `text NOT NULL` | NOT NULL |
| `translations` | `jsonb NOT NULL` | NOT NULL |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

### 149. `translation_settings`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `entity_type` | `text NOT NULL` | NOT NULL |
| `fields` | `jsonb NOT NULL` | NOT NULL |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | NOT NULL |
| `deleted_at` | `timestamptz NULL` | NULLABLE |

## 25 Locking
### 150. `locking`
| Column | Type / Definition | Nullability |
|---|---|---|
| `id` | `text NOT NULL` | NOT NULL |
| `owner_id` | `text NULL` | NULLABLE |
| `expiration` | `timestamptz NULL` | NULLABLE |

