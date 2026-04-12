-- SupaMedusa: Order Module
-- 100% data model match with Medusa v2
-- Source: packages/modules/order/src/migrations/

CREATE TABLE IF NOT EXISTS "order_address" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NULL,
    "company" TEXT NULL,
    "first_name" TEXT NULL,
    "last_name" TEXT NULL,
    "address_1" TEXT NULL,
    "address_2" TEXT NULL,
    "city" TEXT NULL,
    "country_code" TEXT NULL,
    "province" TEXT NULL,
    "postal_code" TEXT NULL,
    "phone" TEXT NULL,
    "metadata" JSONB NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT Now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT Now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "order_address_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_order_address_customer_id" ON "order_address" (customer_id);

DROP TYPE IF EXISTS order_status_enum CASCADE;
CREATE TYPE order_status_enum AS ENUM (
    'pending', 'completed', 'draft', 'archived', 'canceled', 'requires_action'
);

CREATE TABLE IF NOT EXISTS "order" (
    "id" TEXT NOT NULL,
    "region_id" TEXT NULL,
    "display_id" SERIAL,
    "customer_id" TEXT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "sales_channel_id" TEXT NULL,
    "status" order_status_enum NOT NULL DEFAULT 'pending',
    "is_draft_order" BOOLEAN NOT NULL DEFAULT false,
    "email" text NULL,
    "currency_code" text NOT NULL,
    "shipping_address_id" text NULL,
    "billing_address_id" text NULL,
    "no_notification" boolean NULL,
    "custom_display_id" text NULL,
    "locale" text NULL,
    "metadata" jsonb NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    "canceled_at" timestamptz NULL,
    CONSTRAINT "order_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_order_display_id" ON "order" (display_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_order_region_id" ON "order" (region_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_order_customer_id" ON "order" (customer_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_order_currency_code" ON "order" (currency_code) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_order_shipping_address_id" ON "order" (shipping_address_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_order_billing_address_id" ON "order" (billing_address_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_order_deleted_at" ON "order" (deleted_at);
CREATE INDEX IF NOT EXISTS "IDX_order_is_draft_order" ON "order" (is_draft_order) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS "order_summary" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "totals" JSONB NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT Now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT Now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "order_summary_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_order_summary_order_id_version" ON "order_summary" (order_id, version) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS "order_line_item" (
    "id" TEXT NOT NULL,
    "totals_id" TEXT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NULL,
    "thumbnail" TEXT NULL,
    "variant_id" TEXT NULL,
    "product_id" TEXT NULL,
    "product_title" TEXT NULL,
    "product_description" TEXT NULL,
    "product_subtitle" TEXT NULL,
    "product_type" TEXT NULL,
    "product_collection" TEXT NULL,
    "product_handle" TEXT NULL,
    "variant_sku" TEXT NULL,
    "variant_barcode" TEXT NULL,
    "variant_title" TEXT NULL,
    "variant_option_values" JSONB NULL,
    "requires_shipping" BOOLEAN NOT NULL DEFAULT true,
    "is_discountable" BOOLEAN NOT NULL DEFAULT true,
    "is_tax_inclusive" BOOLEAN NOT NULL DEFAULT false,
    "is_custom_price" boolean NOT NULL DEFAULT false,
    "is_giftcard" boolean NOT NULL DEFAULT false,
    "product_type_id" text NULL,
    "compare_at_unit_price" NUMERIC NULL,
    "raw_compare_at_unit_price" JSONB NULL,
    "unit_price" NUMERIC NOT NULL,
    "raw_unit_price" JSONB NOT NULL,
    "metadata" JSONB NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT Now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT Now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "order_line_item_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_order_line_item_variant_id" ON "order_line_item" (variant_id);
CREATE INDEX IF NOT EXISTS "IDX_order_line_item_product_id" ON "order_line_item" (product_id);

CREATE TABLE IF NOT EXISTS "order_item" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "item_id" TEXT NOT NULL,
    "quantity" NUMERIC NOT NULL,
    "raw_quantity" JSONB NOT NULL,
    "fulfilled_quantity" NUMERIC NOT NULL,
    "raw_fulfilled_quantity" JSONB NOT NULL,
    "shipped_quantity" NUMERIC NOT NULL,
    "raw_shipped_quantity" JSONB NOT NULL,
    "return_requested_quantity" NUMERIC NOT NULL,
    "raw_return_requested_quantity" JSONB NOT NULL,
    "return_received_quantity" NUMERIC NOT NULL,
    "raw_return_received_quantity" JSONB NOT NULL,
    "return_dismissed_quantity" NUMERIC NOT NULL,
    "raw_return_dismissed_quantity" JSONB NOT NULL,
    "written_off_quantity" NUMERIC NOT NULL,
    "raw_written_off_quantity" JSONB NOT NULL,
    "delivered_quantity" NUMERIC NOT NULL DEFAULT 0,
    "raw_delivered_quantity" JSONB NULL,
    "unit_price" NUMERIC NULL,
    "raw_unit_price" JSONB NULL,
    "compare_at_unit_price" NUMERIC NULL,
    "raw_compare_at_unit_price" JSONB NULL,
    "metadata" JSONB NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT Now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT Now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "order_item_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_order_item_order_id" ON "order_item" (order_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_order_item_order_id_version" ON "order_item" (order_id, version) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_order_item_item_id" ON "order_item" (item_id) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS "order_shipping_method" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" JSONB NULL,
    "amount" NUMERIC NOT NULL,
    "raw_amount" JSONB NOT NULL,
    "is_tax_inclusive" BOOLEAN NOT NULL DEFAULT false,
    "is_custom_amount" boolean NOT NULL DEFAULT false,
    "shipping_option_id" TEXT NULL,
    "data" JSONB NULL,
    "metadata" JSONB NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT Now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT Now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "order_shipping_method_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_order_shipping_method_shipping_option_id" ON "order_shipping_method" (shipping_option_id);

CREATE TABLE IF NOT EXISTS "order_shipping" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "shipping_method_id" TEXT NOT NULL,
    "return_id" TEXT NULL,
    "claim_id" TEXT NULL,
    "exchange_id" TEXT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT Now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT Now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "order_shipping_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_order_shipping_order_id" ON "order_shipping" (order_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_order_shipping_order_id_version" ON "order_shipping" (order_id, version) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_order_shipping_item_id" ON "order_shipping" (shipping_method_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_order_shipping_return_id" ON "order_shipping" (return_id) WHERE return_id IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_order_shipping_claim_id" ON "order_shipping" (claim_id) WHERE claim_id IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_order_shipping_exchange_id" ON "order_shipping" (exchange_id) WHERE exchange_id IS NOT NULL AND deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS "order_line_item_tax_line" (
    "id" TEXT NOT NULL,
    "description" TEXT NULL,
    "tax_rate_id" TEXT NULL,
    "code" TEXT NOT NULL,
    "rate" NUMERIC NOT NULL,
    "raw_rate" JSONB NOT NULL,
    "provider_id" TEXT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT Now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT Now(),
    "item_id" TEXT NOT NULL,
    "deleted_at" timestamptz NULL,
    CONSTRAINT "order_line_item_tax_line_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_order_line_item_tax_line_item_id" ON "order_line_item_tax_line" (item_id);

CREATE TABLE IF NOT EXISTS "order_line_item_adjustment" (
    "id" TEXT NOT NULL,
    "description" TEXT NULL,
    "promotion_id" TEXT NULL,
    "code" TEXT NULL,
    "amount" NUMERIC NOT NULL,
    "raw_amount" JSONB NOT NULL,
    "provider_id" TEXT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT Now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT Now(),
    "item_id" TEXT NOT NULL,
    "deleted_at" timestamptz NULL,
    CONSTRAINT "order_line_item_adjustment_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_order_line_item_adjustment_item_id" ON "order_line_item_adjustment" (item_id);

CREATE TABLE IF NOT EXISTS "order_shipping_method_adjustment" (
    "id" TEXT NOT NULL,
    "description" TEXT NULL,
    "promotion_id" TEXT NULL,
    "code" TEXT NULL,
    "amount" NUMERIC NOT NULL,
    "raw_amount" JSONB NOT NULL,
    "provider_id" TEXT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT Now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT Now(),
    "shipping_method_id" TEXT NOT NULL,
    "deleted_at" timestamptz NULL,
    CONSTRAINT "order_shipping_method_adjustment_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_order_shipping_method_adjustment_shipping_method_id" ON "order_shipping_method_adjustment" (shipping_method_id);

CREATE TABLE IF NOT EXISTS "order_shipping_method_tax_line" (
    "id" TEXT NOT NULL,
    "description" TEXT NULL,
    "tax_rate_id" TEXT NULL,
    "code" TEXT NOT NULL,
    "rate" NUMERIC NOT NULL,
    "raw_rate" JSONB NOT NULL,
    "provider_id" TEXT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT Now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT Now(),
    "shipping_method_id" TEXT NOT NULL,
    "deleted_at" timestamptz NULL,
    CONSTRAINT "order_shipping_method_tax_line_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_order_shipping_method_tax_line_shipping_method_id" ON "order_shipping_method_tax_line" (shipping_method_id);

CREATE TABLE IF NOT EXISTS "order_transaction" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "amount" NUMERIC NOT NULL,
    "raw_amount" JSONB NOT NULL,
    "currency_code" TEXT NOT NULL,
    "reference" TEXT NULL,
    "reference_id" TEXT NULL,
    "return_id" TEXT NULL,
    "claim_id" TEXT NULL,
    "exchange_id" TEXT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT Now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT Now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "order_transaction_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_order_transaction_order_id_version" ON "order_transaction" (order_id, version) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_order_transaction_currency_code" ON "order_transaction" (currency_code) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_order_transaction_reference_id" ON "order_transaction" (reference_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_order_transaction_return_id" ON "order_transaction" (return_id) WHERE return_id IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_order_transaction_claim_id" ON "order_transaction" (claim_id) WHERE claim_id IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_order_transaction_exchange_id" ON "order_transaction" (exchange_id) WHERE exchange_id IS NOT NULL AND deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS "order_change" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "description" TEXT NULL,
    "change_type" text NULL,
    "status" text check ("status" in ('confirmed','declined','requested','pending','canceled')) NOT NULL DEFAULT 'pending',
    "internal_note" text NULL,
    "created_by" text NULL,
    "requested_by" text NULL,
    "requested_at" timestamptz NULL,
    "confirmed_by" text NULL,
    "confirmed_at" timestamptz NULL,
    "declined_by" text NULL,
    "declined_reason" text NULL,
    "metadata" jsonb NULL,
    "declined_at" timestamptz NULL,
    "canceled_by" text NULL,
    "canceled_at" timestamptz NULL,
    "return_id" text NULL,
    "claim_id" text NULL,
    "exchange_id" text NULL,
    "carry_over_promotions" boolean NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "order_change_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_order_change_order_id" ON "order_change" (order_id);
CREATE INDEX IF NOT EXISTS "IDX_order_change_order_id_version" ON "order_change" (order_id, version);
CREATE INDEX IF NOT EXISTS "IDX_order_change_status" ON "order_change" (status);
CREATE INDEX IF NOT EXISTS "IDX_order_change_change_type" ON "order_change" (change_type);
CREATE INDEX IF NOT EXISTS "IDX_order_change_return_id" ON "order_change" (return_id) WHERE return_id IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_order_change_claim_id" ON "order_change" (claim_id) WHERE claim_id IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_order_change_exchange_id" ON "order_change" (exchange_id) WHERE exchange_id IS NOT NULL AND deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS "order_change_action" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NULL,
    "version" INTEGER NULL,
    "ordering" BIGSERIAL NOT NULL,
    "order_change_id" TEXT NULL,
    "reference" TEXT NULL,
    "reference_id" TEXT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB NULL,
    "amount" NUMERIC NULL,
    "raw_amount" JSONB NULL,
    "internal_note" TEXT NULL,
    "applied" BOOLEAN NOT NULL DEFAULT false,
    "return_id" TEXT NULL,
    "claim_id" TEXT NULL,
    "exchange_id" TEXT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT Now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT Now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "order_change_action_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_order_change_action_order_change_id" ON "order_change_action" (order_change_id);
CREATE INDEX IF NOT EXISTS "IDX_order_change_action_order_id" ON "order_change_action" (order_id);
CREATE INDEX IF NOT EXISTS "IDX_order_change_action_ordering" ON "order_change_action" (ordering);
CREATE INDEX IF NOT EXISTS "IDX_order_change_action_return_id" ON "order_change_action" (return_id) WHERE return_id IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_order_change_action_claim_id" ON "order_change_action" (claim_id) WHERE claim_id IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_order_change_action_exchange_id" ON "order_change_action" (exchange_id) WHERE exchange_id IS NOT NULL AND deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS "return_reason" (
    "id" text NOT NULL,
    "value" text NOT NULL,
    "label" text NOT NULL,
    "description" text NULL,
    "metadata" JSONB NULL,
    "parent_return_reason_id" text NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "return_reason_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_return_reason_value" ON "return_reason" (value) WHERE deleted_at IS NULL;
ALTER TABLE "return_reason" ADD CONSTRAINT "return_reason_parent_return_reason_id_foreign" FOREIGN KEY ("parent_return_reason_id") REFERENCES "return_reason" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION;

-- === Foreign Keys ===

ALTER TABLE "order" ADD CONSTRAINT "order_shipping_address_id_foreign" FOREIGN KEY ("shipping_address_id") REFERENCES "order_address" ("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "order" ADD CONSTRAINT "order_billing_address_id_foreign" FOREIGN KEY ("billing_address_id") REFERENCES "order_address" ("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "order_change" ADD CONSTRAINT "order_change_order_id_foreign" FOREIGN KEY ("order_id") REFERENCES "order" ("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "order_change_action" ADD CONSTRAINT "order_change_action_order_change_id_foreign" FOREIGN KEY ("order_change_id") REFERENCES "order_change" ("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_order_id_foreign" FOREIGN KEY ("order_id") REFERENCES "order" ("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_item_id_foreign" FOREIGN KEY ("item_id") REFERENCES "order_line_item" ("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "order_line_item" ADD CONSTRAINT "order_line_item_totals_id_foreign" FOREIGN KEY ("totals_id") REFERENCES "order_item" ("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "order_line_item_tax_line" ADD CONSTRAINT "order_line_item_tax_line_item_id_foreign" FOREIGN KEY ("item_id") REFERENCES "order_line_item" ("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "order_line_item_adjustment" ADD CONSTRAINT "order_line_item_adjustment_item_id_foreign" FOREIGN KEY ("item_id") REFERENCES "order_line_item" ("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "order_shipping" ADD CONSTRAINT "order_shipping_order_id_foreign" FOREIGN KEY ("order_id") REFERENCES "order" ("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "order_shipping_method_adjustment" ADD CONSTRAINT "order_shipping_method_adjustment_shipping_method_id_foreign" FOREIGN KEY ("shipping_method_id") REFERENCES "order_shipping_method" ("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "order_shipping_method_tax_line" ADD CONSTRAINT "order_shipping_method_tax_line_shipping_method_id_foreign" FOREIGN KEY ("shipping_method_id") REFERENCES "order_shipping_method" ("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "order_transaction" ADD CONSTRAINT "order_transaction_order_id_foreign" FOREIGN KEY ("order_id") REFERENCES "order" ("id") ON UPDATE CASCADE ON DELETE CASCADE;

-- === Return / Exchange / Claim tables (added by subsequent migrations) ===

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'return_status_enum') THEN
    CREATE TYPE return_status_enum AS ENUM ('requested','received','partially_received','canceled');
END IF; END$$;

CREATE TABLE IF NOT EXISTS "return" (
    "id" TEXT NOT NULL, "order_id" TEXT NOT NULL, "claim_id" TEXT NULL, "exchange_id" TEXT NULL,
    "order_version" INTEGER NOT NULL, "display_id" SERIAL,
    "status" return_status_enum NOT NULL DEFAULT 'requested',
    "no_notification" boolean NULL, "refund_amount" NUMERIC NULL, "raw_refund_amount" JSONB NULL,
    "created_by" text NULL,
    "metadata" jsonb NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL, "received_at" timestamptz NULL, "canceled_at" timestamptz NULL,
    CONSTRAINT "return_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_return_order_id" ON "return" (order_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_return_claim_id" ON "return" (claim_id) WHERE claim_id IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_return_exchange_id" ON "return" (exchange_id) WHERE exchange_id IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_return_display_id" ON "return" (display_id) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS "return_item" (
    "id" TEXT NOT NULL, "return_id" TEXT NOT NULL, "reason_id" TEXT NULL, "item_id" TEXT NOT NULL,
    "quantity" NUMERIC NOT NULL, "raw_quantity" JSONB NOT NULL,
    "received_quantity" NUMERIC NOT NULL DEFAULT 0, "raw_received_quantity" JSONB NOT NULL,
    "damaged_quantity" numeric NOT NULL DEFAULT 0, "raw_damaged_quantity" jsonb NULL,
    "note" TEXT NULL, "metadata" JSONB NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "return_item_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_return_item_return_id" ON "return_item" (return_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_return_item_item_id" ON "return_item" (item_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_return_item_reason_id" ON "return_item" (reason_id) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS "order_exchange" (
    "id" TEXT NOT NULL, "order_id" TEXT NOT NULL, "return_id" TEXT NULL,
    "order_version" INTEGER NOT NULL, "display_id" SERIAL,
    "no_notification" BOOLEAN NULL, "allow_backorder" BOOLEAN NOT NULL DEFAULT FALSE,
    "difference_due" NUMERIC NULL, "raw_difference_due" JSONB NULL,
    "created_by" text NULL, "metadata" JSONB NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL, "canceled_at" timestamptz NULL,
    CONSTRAINT "order_exchange_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_order_exchange_display_id" ON "order_exchange" (display_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_order_exchange_order_id" ON "order_exchange" (order_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_order_exchange_return_id" ON "order_exchange" (return_id) WHERE return_id IS NOT NULL AND deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS "order_exchange_item" (
    "id" TEXT NOT NULL, "exchange_id" TEXT NOT NULL, "item_id" TEXT NOT NULL,
    "quantity" NUMERIC NOT NULL, "raw_quantity" JSONB NOT NULL,
    "note" TEXT NULL, "metadata" JSONB NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "order_exchange_item_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_order_exchange_item_exchange_id" ON "order_exchange_item" (exchange_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_order_exchange_item_item_id" ON "order_exchange_item" (item_id) WHERE deleted_at IS NULL;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_claim_type_enum') THEN
    CREATE TYPE order_claim_type_enum AS ENUM ('refund','replace');
END IF; END$$;

CREATE TABLE IF NOT EXISTS "order_claim" (
    "id" TEXT NOT NULL, "order_id" TEXT NOT NULL, "return_id" TEXT NULL,
    "order_version" INTEGER NOT NULL, "display_id" SERIAL,
    "type" order_claim_type_enum NOT NULL,
    "no_notification" BOOLEAN NULL, "refund_amount" NUMERIC NULL, "raw_refund_amount" JSONB NULL,
    "created_by" text NULL, "metadata" JSONB NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL, "canceled_at" timestamptz NULL,
    CONSTRAINT "order_claim_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_order_claim_display_id" ON "order_claim" (display_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_order_claim_order_id" ON "order_claim" (order_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_order_claim_return_id" ON "order_claim" (return_id) WHERE return_id IS NOT NULL AND deleted_at IS NULL;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'claim_reason_enum') THEN
    CREATE TYPE claim_reason_enum AS ENUM ('missing_item','wrong_item','production_failure','other');
END IF; END$$;

CREATE TABLE IF NOT EXISTS "order_claim_item" (
    "id" TEXT NOT NULL, "claim_id" TEXT NOT NULL, "item_id" TEXT NOT NULL,
    "is_additional_item" BOOLEAN NOT NULL DEFAULT FALSE,
    "reason" claim_reason_enum NULL,
    "quantity" NUMERIC NOT NULL, "raw_quantity" JSONB NOT NULL,
    "note" TEXT NULL, "metadata" JSONB NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "order_claim_item_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_order_claim_item_claim_id" ON "order_claim_item" (claim_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_order_claim_item_item_id" ON "order_claim_item" (item_id) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS "order_claim_item_image" (
    "id" TEXT NOT NULL, "claim_item_id" TEXT NOT NULL, "url" TEXT NOT NULL, "metadata" JSONB NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "order_claim_item_image_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_order_claim_item_image_claim_item_id" ON "order_claim_item_image" (claim_item_id) WHERE deleted_at IS NOT NULL;

CREATE TABLE IF NOT EXISTS "order_credit_line" (
    "id" text NOT NULL, "order_id" text NOT NULL, "reference" text NULL, "reference_id" text NULL,
    "amount" numeric NOT NULL, "raw_amount" jsonb NOT NULL, "metadata" jsonb NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "order_credit_line_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_order_credit_line_order_id" ON "order_credit_line" (order_id) WHERE deleted_at IS NOT NULL;
ALTER TABLE "order_credit_line" ADD CONSTRAINT "order_credit_line_order_id_foreign" FOREIGN KEY ("order_id") REFERENCES "order" ("id") ON UPDATE CASCADE;
