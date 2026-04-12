-- SupaMedusa: Cart Module
-- 100% data model match with Medusa v2
-- Source: packages/modules/cart/src/migrations/Migration20240222170223.ts + subsequent migrations

CREATE TABLE IF NOT EXISTS "cart_address" (
    "id" text NOT NULL,
    "customer_id" text NULL,
    "company" text NULL,
    "first_name" text NULL,
    "last_name" text NULL,
    "address_1" text NULL,
    "address_2" text NULL,
    "city" text NULL,
    "country_code" text NULL,
    "province" text NULL,
    "postal_code" text NULL,
    "phone" text NULL,
    "metadata" jsonb NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "cart_address_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_cart_address_deleted_at" ON "cart_address" (deleted_at) WHERE deleted_at IS NOT NULL;

CREATE TABLE IF NOT EXISTS "cart" (
    "id" text NOT NULL,
    "region_id" text NULL,
    "customer_id" text NULL,
    "sales_channel_id" text NULL,
    "email" text NULL,
    "currency_code" text NOT NULL,
    "shipping_address_id" text NULL,
    "billing_address_id" text NULL,
    "locale" text NULL,
    "metadata" jsonb NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "cart_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_cart_customer_id" ON "cart" ("customer_id") WHERE deleted_at IS NULL AND customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS "IDX_cart_shipping_address_id" ON "cart" ("shipping_address_id") WHERE deleted_at IS NULL AND shipping_address_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS "IDX_cart_billing_address_id" ON "cart" ("billing_address_id") WHERE deleted_at IS NULL AND billing_address_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS "IDX_cart_region_id" ON "cart" ("region_id") WHERE deleted_at IS NULL AND region_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS "IDX_cart_sales_channel_id" ON "cart" ("sales_channel_id") WHERE deleted_at IS NULL AND sales_channel_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS "IDX_cart_currency_code" ON "cart" ("currency_code");
CREATE INDEX IF NOT EXISTS "IDX_cart_deleted_at" ON "cart" (deleted_at) WHERE deleted_at IS NOT NULL;

ALTER TABLE "cart" ADD CONSTRAINT "cart_shipping_address_id_foreign" FOREIGN KEY ("shipping_address_id") REFERENCES "cart_address" ("id") ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE "cart" ADD CONSTRAINT "cart_billing_address_id_foreign" FOREIGN KEY ("billing_address_id") REFERENCES "cart_address" ("id") ON UPDATE CASCADE ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS "cart_line_item" (
    "id" text NOT NULL,
    "cart_id" text NOT NULL,
    "title" text NOT NULL,
    "subtitle" text NULL,
    "thumbnail" text NULL,
    "quantity" integer NOT NULL,
    "variant_id" text NULL,
    "product_id" text NULL,
    "product_title" text NULL,
    "product_description" text NULL,
    "product_subtitle" text NULL,
    "product_type" text NULL,
    "product_collection" text NULL,
    "product_handle" text NULL,
    "variant_sku" text NULL,
    "variant_barcode" text NULL,
    "variant_title" text NULL,
    "variant_option_values" jsonb NULL,
    "requires_shipping" boolean NOT NULL DEFAULT true,
    "is_discountable" boolean NOT NULL DEFAULT true,
    "is_tax_inclusive" boolean NOT NULL DEFAULT false,
    "is_custom_price" boolean NOT NULL DEFAULT false,
    "is_giftcard" boolean NOT NULL DEFAULT false,
    "product_type_id" text NULL,
    "compare_at_unit_price" numeric NULL,
    "raw_compare_at_unit_price" jsonb NULL,
    "unit_price" numeric NOT NULL,
    "raw_unit_price" jsonb NOT NULL,
    "metadata" jsonb NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "cart_line_item_pkey" PRIMARY KEY ("id"),
    CONSTRAINT cart_line_item_unit_price_check CHECK (unit_price >= 0)
);
CREATE INDEX IF NOT EXISTS "IDX_line_item_cart_id" ON "cart_line_item" ("cart_id") WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_line_item_product_id" ON "cart_line_item" ("product_id") WHERE deleted_at IS NULL AND product_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS "IDX_line_item_variant_id" ON "cart_line_item" ("variant_id") WHERE deleted_at IS NULL AND variant_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS "IDX_cart_line_item_deleted_at" ON "cart_line_item" (deleted_at) WHERE deleted_at IS NOT NULL;

ALTER TABLE "cart_line_item" ADD CONSTRAINT "cart_line_item_cart_id_foreign" FOREIGN KEY ("cart_id") REFERENCES "cart" ("id") ON UPDATE CASCADE ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS "cart_line_item_adjustment" (
    "id" text NOT NULL,
    "description" text NULL,
    "promotion_id" text NULL,
    "code" text NULL,
    "amount" numeric NOT NULL,
    "raw_amount" jsonb NOT NULL,
    "provider_id" text NULL,
    "is_tax_inclusive" boolean NOT NULL DEFAULT false,
    "metadata" jsonb NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    "item_id" text NULL,
    CONSTRAINT "cart_line_item_adjustment_pkey" PRIMARY KEY ("id"),
    CONSTRAINT cart_line_item_adjustment_check CHECK (amount >= 0)
);
CREATE INDEX IF NOT EXISTS "IDX_adjustment_item_id" ON "cart_line_item_adjustment" ("item_id") WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_line_item_adjustment_promotion_id" ON "cart_line_item_adjustment" ("promotion_id") WHERE deleted_at IS NULL AND promotion_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS "IDX_cart_line_item_adjustment_deleted_at" ON "cart_line_item_adjustment" (deleted_at) WHERE deleted_at IS NOT NULL;

ALTER TABLE "cart_line_item_adjustment" ADD CONSTRAINT "cart_line_item_adjustment_item_id_foreign" FOREIGN KEY ("item_id") REFERENCES "cart_line_item" ("id") ON UPDATE CASCADE ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS "cart_line_item_tax_line" (
    "id" text NOT NULL,
    "description" text NULL,
    "tax_rate_id" text NULL,
    "code" text NOT NULL,
    "rate" numeric NOT NULL,
    "provider_id" text NULL,
    "metadata" jsonb NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    "item_id" text NULL,
    CONSTRAINT "cart_line_item_tax_line_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_tax_line_item_id" ON "cart_line_item_tax_line" ("item_id") WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_line_item_tax_line_tax_rate_id" ON "cart_line_item_tax_line" ("tax_rate_id") WHERE deleted_at IS NULL AND tax_rate_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS "IDX_cart_line_item_tax_line_deleted_at" ON "cart_line_item_tax_line" (deleted_at) WHERE deleted_at IS NOT NULL;

ALTER TABLE "cart_line_item_tax_line" ADD CONSTRAINT "cart_line_item_tax_line_item_id_foreign" FOREIGN KEY ("item_id") REFERENCES "cart_line_item" ("id") ON UPDATE CASCADE ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS "cart_shipping_method" (
    "id" text NOT NULL,
    "cart_id" text NOT NULL,
    "name" text NOT NULL,
    "description" jsonb NULL,
    "amount" numeric NOT NULL,
    "raw_amount" jsonb NOT NULL,
    "is_tax_inclusive" boolean NOT NULL DEFAULT false,
    "shipping_option_id" text NULL,
    "data" jsonb NULL,
    "metadata" jsonb NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "cart_shipping_method_pkey" PRIMARY KEY ("id"),
    CONSTRAINT cart_shipping_method_check CHECK (amount >= 0)
);
CREATE INDEX IF NOT EXISTS "IDX_shipping_method_cart_id" ON "cart_shipping_method" ("cart_id") WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_shipping_method_option_id" ON "cart_shipping_method" ("shipping_option_id") WHERE deleted_at IS NULL AND shipping_option_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS "IDX_cart_shipping_method_deleted_at" ON "cart_shipping_method" (deleted_at) WHERE deleted_at IS NOT NULL;

ALTER TABLE "cart_shipping_method" ADD CONSTRAINT "cart_shipping_method_cart_id_foreign" FOREIGN KEY ("cart_id") REFERENCES "cart" ("id") ON UPDATE CASCADE ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS "cart_shipping_method_adjustment" (
    "id" text NOT NULL,
    "description" text NULL,
    "promotion_id" text NULL,
    "code" text NULL,
    "amount" numeric NOT NULL,
    "raw_amount" jsonb NOT NULL,
    "provider_id" text NULL,
    "metadata" jsonb NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    "shipping_method_id" text NULL,
    CONSTRAINT "cart_shipping_method_adjustment_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_adjustment_shipping_method_id" ON "cart_shipping_method_adjustment" ("shipping_method_id") WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_shipping_method_adjustment_promotion_id" ON "cart_shipping_method_adjustment" ("promotion_id") WHERE deleted_at IS NULL AND promotion_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS "IDX_cart_shipping_method_adjustment_deleted_at" ON "cart_shipping_method_adjustment" (deleted_at) WHERE deleted_at IS NOT NULL;

ALTER TABLE "cart_shipping_method_adjustment" ADD CONSTRAINT "cart_shipping_method_adjustment_shipping_method_id_foreign" FOREIGN KEY ("shipping_method_id") REFERENCES "cart_shipping_method" ("id") ON UPDATE CASCADE ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS "cart_shipping_method_tax_line" (
    "id" text NOT NULL,
    "description" text NULL,
    "tax_rate_id" text NULL,
    "code" text NOT NULL,
    "rate" numeric NOT NULL,
    "provider_id" text NULL,
    "metadata" jsonb NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    "shipping_method_id" text NULL,
    CONSTRAINT "cart_shipping_method_tax_line_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_tax_line_shipping_method_id" ON "cart_shipping_method_tax_line" ("shipping_method_id") WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_shipping_method_tax_line_tax_rate_id" ON "cart_shipping_method_tax_line" ("tax_rate_id") WHERE deleted_at IS NULL AND tax_rate_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS "IDX_cart_shipping_method_tax_line_deleted_at" ON "cart_shipping_method_tax_line" (deleted_at) WHERE deleted_at IS NOT NULL;

ALTER TABLE "cart_shipping_method_tax_line" ADD CONSTRAINT "cart_shipping_method_tax_line_shipping_method_id_foreign" FOREIGN KEY ("shipping_method_id") REFERENCES "cart_shipping_method" ("id") ON UPDATE CASCADE ON DELETE CASCADE;

-- === Credit Line (added by subsequent migration) ===

CREATE TABLE IF NOT EXISTS "credit_line" (
    "id" text NOT NULL, "cart_id" text NOT NULL, "reference" text NULL, "reference_id" text NULL,
    "amount" numeric NOT NULL, "raw_amount" jsonb NOT NULL, "metadata" jsonb NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "credit_line_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_credit_line_cart_id" ON "credit_line" (cart_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_credit_line_deleted_at" ON "credit_line" (deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_cart_credit_line_reference_reference_id" ON "credit_line" (reference, reference_id) WHERE deleted_at IS NOT NULL;
ALTER TABLE "credit_line" ADD CONSTRAINT "credit_line_cart_id_foreign" FOREIGN KEY ("cart_id") REFERENCES "cart" ("id") ON UPDATE CASCADE;
