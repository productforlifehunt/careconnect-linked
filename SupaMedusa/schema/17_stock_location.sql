-- SupaMedusa: Stock Location Module
-- 100% data model match with Medusa v2
-- Source: packages/modules/stock-location/src/migrations/

CREATE TABLE IF NOT EXISTS "stock_location_address" (
    "id" text NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    "address_1" text NOT NULL,
    "address_2" text NULL,
    "company" text NULL,
    "city" text NULL,
    "country_code" text NOT NULL,
    "phone" text NULL,
    "province" text NULL,
    "postal_code" text NULL,
    "metadata" jsonb NULL,
    CONSTRAINT "stock_location_address_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_stock_location_address_deleted_at" ON "stock_location_address" (deleted_at) WHERE deleted_at IS NOT NULL;

CREATE TABLE IF NOT EXISTS "stock_location" (
    "id" text NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    "name" text NOT NULL,
    "address_id" text NULL,
    "metadata" jsonb NULL,
    CONSTRAINT "stock_location_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_stock_location_deleted_at" ON "stock_location" (deleted_at) WHERE deleted_at IS NOT NULL;

ALTER TABLE "stock_location" ADD CONSTRAINT "stock_location_address_id_foreign" FOREIGN KEY ("address_id") REFERENCES "stock_location_address" ("id") ON UPDATE CASCADE ON DELETE SET NULL;
