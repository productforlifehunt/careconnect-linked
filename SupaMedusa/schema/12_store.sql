-- SupaMedusa: Store Module
-- 100% data model match with Medusa v2
-- Source: packages/modules/store/src/migrations/

CREATE TABLE IF NOT EXISTS "store" (
    "id" text NOT NULL,
    "name" text NOT NULL DEFAULT 'Medusa Store',
    "default_sales_channel_id" text NULL,
    "default_region_id" text NULL,
    "default_location_id" text NULL,
    "metadata" jsonb NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "store_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_store_deleted_at" ON "store" (deleted_at) WHERE deleted_at IS NOT NULL;

CREATE TABLE IF NOT EXISTS "store_currency" (
    "id" text NOT NULL,
    "currency_code" text NOT NULL,
    "is_default" boolean NOT NULL DEFAULT false,
    "store_id" text NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "store_currency_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_store_currency_deleted_at" ON "store_currency" (deleted_at) WHERE deleted_at IS NOT NULL;
ALTER TABLE "store_currency" ADD CONSTRAINT "store_currency_store_id_foreign" FOREIGN KEY ("store_id") REFERENCES "store" ("id") ON UPDATE CASCADE ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS "store_locale" (
    "id" text NOT NULL,
    "locale_code" text NOT NULL,
    "is_default" boolean NOT NULL DEFAULT false,
    "store_id" text NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "store_locale_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_store_locale_store_id" ON "store_locale" ("store_id") WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_store_locale_deleted_at" ON "store_locale" ("deleted_at") WHERE deleted_at IS NULL;
ALTER TABLE "store_locale" ADD CONSTRAINT "store_locale_store_id_foreign" FOREIGN KEY ("store_id") REFERENCES "store" ("id") ON UPDATE CASCADE ON DELETE CASCADE;
