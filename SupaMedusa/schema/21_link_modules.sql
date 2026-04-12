-- SupaMedusa: Link Modules (Cross-Module Join Tables)
-- 100% data model match with Medusa v2
-- Source: packages/modules/link-modules/src/definitions/
--
-- Medusa uses link modules to connect entities across modules.
-- Each link table has: id, FK columns, created_at, updated_at, deleted_at.
-- Some link tables have extra fields (noted inline).

-- Tracks which link tables have been created (Medusa internal bookkeeping)
CREATE TABLE IF NOT EXISTS "link_module_migrations" (
    "id" SERIAL PRIMARY KEY,
    "table_name" VARCHAR(255) NOT NULL UNIQUE,
    "link_descriptor" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── cart_payment_collection ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "cart_payment_collection" (
    "id" text NOT NULL,
    "cart_id" text NOT NULL,
    "payment_collection_id" text NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" timestamptz NULL,
    CONSTRAINT "cart_payment_collection_pkey" PRIMARY KEY ("cart_id", "payment_collection_id")
);
CREATE INDEX IF NOT EXISTS "IDX_cart_payment_collection_cart_id" ON "cart_payment_collection" ("cart_id") WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_cart_payment_collection_payment_collection_id" ON "cart_payment_collection" ("payment_collection_id") WHERE deleted_at IS NULL;

-- ─── cart_promotion ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "cart_promotion" (
    "id" text NOT NULL,
    "cart_id" text NOT NULL,
    "promotion_id" text NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" timestamptz NULL,
    CONSTRAINT "cart_promotion_pkey" PRIMARY KEY ("cart_id", "promotion_id")
);
CREATE INDEX IF NOT EXISTS "IDX_cart_promotion_cart_id" ON "cart_promotion" ("cart_id") WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_cart_promotion_promotion_id" ON "cart_promotion" ("promotion_id") WHERE deleted_at IS NULL;

-- ─── customer_account_holder ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "customer_account_holder" (
    "id" text NOT NULL,
    "customer_id" text NOT NULL,
    "account_holder_id" text NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" timestamptz NULL,
    CONSTRAINT "customer_account_holder_pkey" PRIMARY KEY ("customer_id", "account_holder_id")
);
CREATE INDEX IF NOT EXISTS "IDX_customer_account_holder_customer_id" ON "customer_account_holder" ("customer_id") WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_customer_account_holder_account_holder_id" ON "customer_account_holder" ("account_holder_id") WHERE deleted_at IS NULL;

-- ─── location_fulfillment_provider ───────────────────────────────────
CREATE TABLE IF NOT EXISTS "location_fulfillment_provider" (
    "id" text NOT NULL,
    "stock_location_id" text NOT NULL,
    "fulfillment_provider_id" text NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" timestamptz NULL,
    CONSTRAINT "location_fulfillment_provider_pkey" PRIMARY KEY ("stock_location_id", "fulfillment_provider_id")
);
CREATE INDEX IF NOT EXISTS "IDX_location_fulfillment_provider_stock_location_id" ON "location_fulfillment_provider" ("stock_location_id") WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_location_fulfillment_provider_fulfillment_provider_id" ON "location_fulfillment_provider" ("fulfillment_provider_id") WHERE deleted_at IS NULL;

-- ─── location_fulfillment_set ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "location_fulfillment_set" (
    "id" text NOT NULL,
    "stock_location_id" text NOT NULL,
    "fulfillment_set_id" text NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" timestamptz NULL,
    CONSTRAINT "location_fulfillment_set_pkey" PRIMARY KEY ("stock_location_id", "fulfillment_set_id")
);
CREATE INDEX IF NOT EXISTS "IDX_location_fulfillment_set_stock_location_id" ON "location_fulfillment_set" ("stock_location_id") WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_location_fulfillment_set_fulfillment_set_id" ON "location_fulfillment_set" ("fulfillment_set_id") WHERE deleted_at IS NULL;

-- ─── invite_rbac_role ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "invite_rbac_role" (
    "id" text NOT NULL,
    "invite_id" text NOT NULL,
    "rbac_role_id" text NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" timestamptz NULL,
    CONSTRAINT "invite_rbac_role_pkey" PRIMARY KEY ("invite_id", "rbac_role_id")
);
CREATE INDEX IF NOT EXISTS "IDX_invite_rbac_role_invite_id" ON "invite_rbac_role" ("invite_id") WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_invite_rbac_role_rbac_role_id" ON "invite_rbac_role" ("rbac_role_id") WHERE deleted_at IS NULL;

-- ─── order_cart ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "order_cart" (
    "id" text NOT NULL,
    "order_id" text NOT NULL,
    "cart_id" text NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" timestamptz NULL,
    CONSTRAINT "order_cart_pkey" PRIMARY KEY ("order_id", "cart_id")
);
CREATE INDEX IF NOT EXISTS "IDX_order_cart_order_id" ON "order_cart" ("order_id") WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_order_cart_cart_id" ON "order_cart" ("cart_id") WHERE deleted_at IS NULL;

-- ─── order_claim_payment_collection ──────────────────────────────────
CREATE TABLE IF NOT EXISTS "order_claim_payment_collection" (
    "id" text NOT NULL,
    "claim_id" text NOT NULL,
    "payment_collection_id" text NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" timestamptz NULL,
    CONSTRAINT "order_claim_payment_collection_pkey" PRIMARY KEY ("claim_id", "payment_collection_id")
);
CREATE INDEX IF NOT EXISTS "IDX_order_claim_payment_collection_claim_id" ON "order_claim_payment_collection" ("claim_id") WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_order_claim_payment_collection_payment_collection_id" ON "order_claim_payment_collection" ("payment_collection_id") WHERE deleted_at IS NULL;

-- ─── order_exchange_payment_collection ───────────────────────────────
CREATE TABLE IF NOT EXISTS "order_exchange_payment_collection" (
    "id" text NOT NULL,
    "exchange_id" text NOT NULL,
    "payment_collection_id" text NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" timestamptz NULL,
    CONSTRAINT "order_exchange_payment_collection_pkey" PRIMARY KEY ("exchange_id", "payment_collection_id")
);
CREATE INDEX IF NOT EXISTS "IDX_order_exchange_payment_collection_exchange_id" ON "order_exchange_payment_collection" ("exchange_id") WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_order_exchange_payment_collection_payment_collection_id" ON "order_exchange_payment_collection" ("payment_collection_id") WHERE deleted_at IS NULL;

-- ─── order_fulfillment ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "order_fulfillment" (
    "id" text NOT NULL,
    "order_id" text NOT NULL,
    "fulfillment_id" text NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" timestamptz NULL,
    CONSTRAINT "order_fulfillment_pkey" PRIMARY KEY ("order_id", "fulfillment_id")
);
CREATE INDEX IF NOT EXISTS "IDX_order_fulfillment_order_id" ON "order_fulfillment" ("order_id") WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_order_fulfillment_fulfillment_id" ON "order_fulfillment" ("fulfillment_id") WHERE deleted_at IS NULL;

-- ─── order_payment_collection ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "order_payment_collection" (
    "id" text NOT NULL,
    "order_id" text NOT NULL,
    "payment_collection_id" text NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" timestamptz NULL,
    CONSTRAINT "order_payment_collection_pkey" PRIMARY KEY ("order_id", "payment_collection_id")
);
CREATE INDEX IF NOT EXISTS "IDX_order_payment_collection_order_id" ON "order_payment_collection" ("order_id") WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_order_payment_collection_payment_collection_id" ON "order_payment_collection" ("payment_collection_id") WHERE deleted_at IS NULL;

-- ─── order_promotion ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "order_promotion" (
    "id" text NOT NULL,
    "order_id" text NOT NULL,
    "promotion_id" text NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" timestamptz NULL,
    CONSTRAINT "order_promotion_pkey" PRIMARY KEY ("order_id", "promotion_id")
);
CREATE INDEX IF NOT EXISTS "IDX_order_promotion_order_id" ON "order_promotion" ("order_id") WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_order_promotion_promotion_id" ON "order_promotion" ("promotion_id") WHERE deleted_at IS NULL;

-- ─── return_fulfillment ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "return_fulfillment" (
    "id" text NOT NULL,
    "return_id" text NOT NULL,
    "fulfillment_id" text NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" timestamptz NULL,
    CONSTRAINT "return_fulfillment_pkey" PRIMARY KEY ("return_id", "fulfillment_id")
);
CREATE INDEX IF NOT EXISTS "IDX_return_fulfillment_return_id" ON "return_fulfillment" ("return_id") WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_return_fulfillment_fulfillment_id" ON "return_fulfillment" ("fulfillment_id") WHERE deleted_at IS NULL;

-- ─── product_sales_channel ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "product_sales_channel" (
    "id" text NOT NULL,
    "product_id" text NOT NULL,
    "sales_channel_id" text NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" timestamptz NULL,
    CONSTRAINT "product_sales_channel_pkey" PRIMARY KEY ("product_id", "sales_channel_id")
);
CREATE INDEX IF NOT EXISTS "IDX_product_sales_channel_product_id" ON "product_sales_channel" ("product_id") WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_product_sales_channel_sales_channel_id" ON "product_sales_channel" ("sales_channel_id") WHERE deleted_at IS NULL;

-- ─── product_shipping_profile ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "product_shipping_profile" (
    "id" text NOT NULL,
    "product_id" text NOT NULL,
    "shipping_profile_id" text NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" timestamptz NULL,
    CONSTRAINT "product_shipping_profile_pkey" PRIMARY KEY ("product_id", "shipping_profile_id")
);
CREATE INDEX IF NOT EXISTS "IDX_product_shipping_profile_product_id" ON "product_shipping_profile" ("product_id") WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_product_shipping_profile_shipping_profile_id" ON "product_shipping_profile" ("shipping_profile_id") WHERE deleted_at IS NULL;

-- ─── product_variant_inventory_item (has extra field) ────────────────
CREATE TABLE IF NOT EXISTS "product_variant_inventory_item" (
    "id" text NOT NULL,
    "variant_id" text NOT NULL,
    "inventory_item_id" text NOT NULL,
    "required_quantity" integer NOT NULL DEFAULT 1,
    "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" timestamptz NULL,
    CONSTRAINT "product_variant_inventory_item_pkey" PRIMARY KEY ("variant_id", "inventory_item_id")
);
CREATE INDEX IF NOT EXISTS "IDX_product_variant_inventory_item_variant_id" ON "product_variant_inventory_item" ("variant_id") WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_product_variant_inventory_item_inventory_item_id" ON "product_variant_inventory_item" ("inventory_item_id") WHERE deleted_at IS NULL;

-- ─── product_variant_price_set ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS "product_variant_price_set" (
    "id" text NOT NULL,
    "variant_id" text NOT NULL,
    "price_set_id" text NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" timestamptz NULL,
    CONSTRAINT "product_variant_price_set_pkey" PRIMARY KEY ("variant_id", "price_set_id")
);
CREATE INDEX IF NOT EXISTS "IDX_product_variant_price_set_variant_id" ON "product_variant_price_set" ("variant_id") WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_product_variant_price_set_price_set_id" ON "product_variant_price_set" ("price_set_id") WHERE deleted_at IS NULL;

-- ─── publishable_api_key_sales_channel ───────────────────────────────
CREATE TABLE IF NOT EXISTS "publishable_api_key_sales_channel" (
    "id" text NOT NULL,
    "publishable_key_id" text NOT NULL,
    "sales_channel_id" text NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" timestamptz NULL,
    CONSTRAINT "publishable_api_key_sales_channel_pkey" PRIMARY KEY ("publishable_key_id", "sales_channel_id")
);
CREATE INDEX IF NOT EXISTS "IDX_publishable_api_key_sales_channel_publishable_key_id" ON "publishable_api_key_sales_channel" ("publishable_key_id") WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_publishable_api_key_sales_channel_sales_channel_id" ON "publishable_api_key_sales_channel" ("sales_channel_id") WHERE deleted_at IS NULL;

-- ─── region_payment_provider ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "region_payment_provider" (
    "id" text NOT NULL,
    "region_id" text NOT NULL,
    "payment_provider_id" text NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" timestamptz NULL,
    CONSTRAINT "region_payment_provider_pkey" PRIMARY KEY ("region_id", "payment_provider_id")
);
CREATE INDEX IF NOT EXISTS "IDX_region_payment_provider_region_id" ON "region_payment_provider" ("region_id") WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_region_payment_provider_payment_provider_id" ON "region_payment_provider" ("payment_provider_id") WHERE deleted_at IS NULL;

-- ─── sales_channel_stock_location ────────────────────────────────────
CREATE TABLE IF NOT EXISTS "sales_channel_stock_location" (
    "id" text NOT NULL,
    "sales_channel_id" text NOT NULL,
    "stock_location_id" text NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" timestamptz NULL,
    CONSTRAINT "sales_channel_stock_location_pkey" PRIMARY KEY ("sales_channel_id", "stock_location_id")
);
CREATE INDEX IF NOT EXISTS "IDX_sales_channel_stock_location_sales_channel_id" ON "sales_channel_stock_location" ("sales_channel_id") WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_sales_channel_stock_location_stock_location_id" ON "sales_channel_stock_location" ("stock_location_id") WHERE deleted_at IS NULL;

-- ─── shipping_option_price_set ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS "shipping_option_price_set" (
    "id" text NOT NULL,
    "shipping_option_id" text NOT NULL,
    "price_set_id" text NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" timestamptz NULL,
    CONSTRAINT "shipping_option_price_set_pkey" PRIMARY KEY ("shipping_option_id", "price_set_id")
);
CREATE INDEX IF NOT EXISTS "IDX_shipping_option_price_set_shipping_option_id" ON "shipping_option_price_set" ("shipping_option_id") WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_shipping_option_price_set_price_set_id" ON "shipping_option_price_set" ("price_set_id") WHERE deleted_at IS NULL;

-- ─── user_rbac_role ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "user_rbac_role" (
    "id" text NOT NULL,
    "user_id" text NOT NULL,
    "rbac_role_id" text NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" timestamptz NULL,
    CONSTRAINT "user_rbac_role_pkey" PRIMARY KEY ("user_id", "rbac_role_id")
);
CREATE INDEX IF NOT EXISTS "IDX_user_rbac_role_user_id" ON "user_rbac_role" ("user_id") WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_user_rbac_role_rbac_role_id" ON "user_rbac_role" ("rbac_role_id") WHERE deleted_at IS NULL;
