-- SupaMedusa: Fulfillment Module
-- 100% data model match with Medusa v2
-- Source: packages/modules/fulfillment/src/migrations/ (new DB path)

CREATE TABLE IF NOT EXISTS "fulfillment_address" (
    "id" text NOT NULL, "company" text NULL, "first_name" text NULL, "last_name" text NULL,
    "address_1" text NULL, "address_2" text NULL, "city" text NULL, "country_code" text NULL,
    "province" text NULL, "postal_code" text NULL, "phone" text NULL, "metadata" jsonb NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "fulfillment_address_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_fulfillment_address_deleted_at" ON "fulfillment_address" (deleted_at) WHERE deleted_at IS NOT NULL;

CREATE TABLE IF NOT EXISTS "fulfillment_provider" (
    "id" text NOT NULL, "is_enabled" boolean NOT NULL DEFAULT true,
    "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "fulfillment_provider_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "fulfillment_set" (
    "id" text NOT NULL, "name" text NOT NULL, "type" text NOT NULL, "metadata" jsonb NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "fulfillment_set_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_fulfillment_set_name_unique" ON "fulfillment_set" (name) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_fulfillment_set_deleted_at" ON "fulfillment_set" (deleted_at) WHERE deleted_at IS NOT NULL;

CREATE TABLE IF NOT EXISTS "service_zone" (
    "id" text NOT NULL, "name" text NOT NULL, "metadata" jsonb NULL, "fulfillment_set_id" text NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "service_zone_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_service_zone_name_unique" ON "service_zone" (name) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_service_zone_fulfillment_set_id" ON "service_zone" (fulfillment_set_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_service_zone_deleted_at" ON "service_zone" (deleted_at) WHERE deleted_at IS NOT NULL;

CREATE TABLE IF NOT EXISTS "geo_zone" (
    "id" text NOT NULL,
    "type" text CHECK ("type" IN ('country','province','city','zip')) NOT NULL DEFAULT 'country',
    "country_code" text NOT NULL, "province_code" text NULL, "city" text NULL,
    "service_zone_id" text NOT NULL, "postal_expression" jsonb NULL, "metadata" jsonb NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "geo_zone_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_geo_zone_country_code" ON "geo_zone" (country_code) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_geo_zone_province_code" ON "geo_zone" (province_code) WHERE deleted_at IS NULL AND province_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS "IDX_geo_zone_city" ON "geo_zone" (city) WHERE deleted_at IS NULL AND city IS NOT NULL;
CREATE INDEX IF NOT EXISTS "IDX_geo_zone_service_zone_id" ON "geo_zone" (service_zone_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_geo_zone_deleted_at" ON "geo_zone" (deleted_at) WHERE deleted_at IS NOT NULL;

CREATE TABLE IF NOT EXISTS "shipping_option_type" (
    "id" text NOT NULL, "label" text NOT NULL, "description" text NULL, "code" text NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "shipping_option_type_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_shipping_option_type_deleted_at" ON "shipping_option_type" (deleted_at) WHERE deleted_at IS NOT NULL;

CREATE TABLE IF NOT EXISTS "shipping_profile" (
    "id" text NOT NULL, "name" text NOT NULL, "type" text NOT NULL, "metadata" jsonb NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "shipping_profile_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_shipping_profile_name_unique" ON "shipping_profile" (name) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_shipping_profile_deleted_at" ON "shipping_profile" (deleted_at) WHERE deleted_at IS NOT NULL;

CREATE TABLE IF NOT EXISTS "shipping_option" (
    "id" text NOT NULL, "name" text NOT NULL,
    "price_type" text CHECK ("price_type" IN ('calculated','flat')) NOT NULL DEFAULT 'flat',
    "service_zone_id" text NOT NULL, "shipping_profile_id" text NULL, "provider_id" text NULL,
    "data" jsonb NULL, "metadata" jsonb NULL, "shipping_option_type_id" text NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "shipping_option_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "shipping_option_shipping_option_type_id_unique" UNIQUE ("shipping_option_type_id")
);
CREATE INDEX IF NOT EXISTS "IDX_shipping_option_service_zone_id" ON "shipping_option" (service_zone_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_shipping_option_shipping_profile_id" ON "shipping_option" (shipping_profile_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_shipping_option_provider_id" ON "shipping_option" (provider_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_shipping_option_shipping_option_type_id" ON "shipping_option" (shipping_option_type_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_shipping_option_deleted_at" ON "shipping_option" (deleted_at) WHERE deleted_at IS NOT NULL;

CREATE TABLE IF NOT EXISTS "shipping_option_rule" (
    "id" text NOT NULL, "attribute" text NOT NULL,
    "operator" text CHECK ("operator" IN ('in','eq','ne','gt','gte','lt','lte','nin')) NOT NULL,
    "value" jsonb NULL, "shipping_option_id" text NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "shipping_option_rule_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_shipping_option_rule_shipping_option_id" ON "shipping_option_rule" (shipping_option_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_shipping_option_rule_deleted_at" ON "shipping_option_rule" (deleted_at) WHERE deleted_at IS NOT NULL;

CREATE TABLE IF NOT EXISTS "fulfillment" (
    "id" text NOT NULL, "location_id" text NOT NULL, "packed_at" timestamptz NULL,
    "shipped_at" timestamptz NULL, "delivered_at" timestamptz NULL, "canceled_at" timestamptz NULL,
    "data" jsonb NULL, "provider_id" text NULL, "shipping_option_id" text NULL,
    "marked_shipped_by" text NULL, "created_by" text NULL,
    "requires_shipping" boolean NOT NULL DEFAULT true,
    "metadata" jsonb NULL, "delivery_address_id" text NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "fulfillment_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "fulfillment_delivery_address_id_unique" UNIQUE ("delivery_address_id")
);
CREATE INDEX IF NOT EXISTS "IDX_fulfillment_location_id" ON "fulfillment" (location_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_fulfillment_provider_id" ON "fulfillment" (provider_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_fulfillment_shipping_option_id" ON "fulfillment" (shipping_option_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_fulfillment_deleted_at" ON "fulfillment" (deleted_at) WHERE deleted_at IS NOT NULL;

CREATE TABLE IF NOT EXISTS "fulfillment_label" (
    "id" text NOT NULL, "tracking_number" text NOT NULL, "tracking_url" text NOT NULL,
    "label_url" text NOT NULL, "fulfillment_id" text NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "fulfillment_label_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_fulfillment_label_fulfillment_id" ON "fulfillment_label" (fulfillment_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_fulfillment_label_deleted_at" ON "fulfillment_label" (deleted_at) WHERE deleted_at IS NOT NULL;

CREATE TABLE IF NOT EXISTS "fulfillment_item" (
    "id" text NOT NULL, "title" text NOT NULL, "sku" text NOT NULL, "barcode" text NOT NULL,
    "quantity" numeric NOT NULL, "raw_quantity" jsonb NOT NULL,
    "line_item_id" text NULL, "inventory_item_id" text NULL, "fulfillment_id" text NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "fulfillment_item_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_fulfillment_item_line_item_id" ON "fulfillment_item" (line_item_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_fulfillment_item_inventory_item_id" ON "fulfillment_item" (inventory_item_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_fulfillment_item_fulfillment_id" ON "fulfillment_item" (fulfillment_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_fulfillment_item_deleted_at" ON "fulfillment_item" (deleted_at) WHERE deleted_at IS NOT NULL;

-- === Foreign Keys ===
ALTER TABLE "service_zone" ADD CONSTRAINT "service_zone_fulfillment_set_id_foreign" FOREIGN KEY ("fulfillment_set_id") REFERENCES "fulfillment_set" ("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "geo_zone" ADD CONSTRAINT "geo_zone_service_zone_id_foreign" FOREIGN KEY ("service_zone_id") REFERENCES "service_zone" ("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "shipping_option" ADD CONSTRAINT "shipping_option_service_zone_id_foreign" FOREIGN KEY ("service_zone_id") REFERENCES "service_zone" ("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "shipping_option" ADD CONSTRAINT "shipping_option_shipping_profile_id_foreign" FOREIGN KEY ("shipping_profile_id") REFERENCES "shipping_profile" ("id") ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE "shipping_option" ADD CONSTRAINT "shipping_option_provider_id_foreign" FOREIGN KEY ("provider_id") REFERENCES "fulfillment_provider" ("id") ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE "shipping_option" ADD CONSTRAINT "shipping_option_shipping_option_type_id_foreign" FOREIGN KEY ("shipping_option_type_id") REFERENCES "shipping_option_type" ("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "shipping_option_rule" ADD CONSTRAINT "shipping_option_rule_shipping_option_id_foreign" FOREIGN KEY ("shipping_option_id") REFERENCES "shipping_option" ("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "fulfillment" ADD CONSTRAINT "fulfillment_provider_id_foreign" FOREIGN KEY ("provider_id") REFERENCES "fulfillment_provider" ("id") ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE "fulfillment" ADD CONSTRAINT "fulfillment_shipping_option_id_foreign" FOREIGN KEY ("shipping_option_id") REFERENCES "shipping_option" ("id") ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE "fulfillment" ADD CONSTRAINT "fulfillment_delivery_address_id_foreign" FOREIGN KEY ("delivery_address_id") REFERENCES "fulfillment_address" ("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "fulfillment_label" ADD CONSTRAINT "fulfillment_label_fulfillment_id_foreign" FOREIGN KEY ("fulfillment_id") REFERENCES "fulfillment" ("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "fulfillment_item" ADD CONSTRAINT "fulfillment_item_fulfillment_id_foreign" FOREIGN KEY ("fulfillment_id") REFERENCES "fulfillment" ("id") ON UPDATE CASCADE ON DELETE CASCADE;
