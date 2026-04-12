-- SupaMedusa: Sales Channel Module
-- 100% data model match with Medusa v2
-- Source: packages/modules/sales-channel/src/migrations/

CREATE TABLE IF NOT EXISTS "sales_channel" (
    "id" text NOT NULL,
    "name" text NOT NULL,
    "description" text NULL,
    "is_disabled" boolean NOT NULL DEFAULT false,
    "metadata" jsonb NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "sales_channel_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_sales_channel_deleted_at" ON "sales_channel" ("deleted_at");
