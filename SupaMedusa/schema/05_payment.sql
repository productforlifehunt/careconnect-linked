-- SupaMedusa: Payment Module
-- 100% data model match with Medusa v2
-- Source: packages/modules/payment/src/migrations/

CREATE TABLE IF NOT EXISTS "payment_collection" (
    "id" TEXT NOT NULL,
    "currency_code" TEXT NOT NULL,
    "amount" NUMERIC NOT NULL,
    "raw_amount" JSONB NOT NULL,
    "authorized_amount" NUMERIC NULL,
    "raw_authorized_amount" JSONB NULL,
    "captured_amount" NUMERIC NULL,
    "raw_captured_amount" JSONB NULL,
    "refunded_amount" NUMERIC NULL,
    "raw_refunded_amount" JSONB NULL,
    "region_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "deleted_at" TIMESTAMPTZ NULL,
    "completed_at" TIMESTAMPTZ NULL,
    "status" TEXT CHECK ("status" IN ('not_paid','awaiting','authorized','partially_authorized','canceled')) NOT NULL DEFAULT 'not_paid',
    "metadata" JSONB NULL,
    CONSTRAINT "payment_collection_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_payment_collection_region_id" ON "payment_collection" ("region_id") WHERE "deleted_at" IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_payment_collection_deleted_at" ON "payment_collection" ("deleted_at") WHERE "deleted_at" IS NOT NULL;

CREATE TABLE IF NOT EXISTS "payment_provider" (
    "id" TEXT NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT "payment_provider_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "account_holder" (
    "id" text NOT NULL,
    "provider_id" text NOT NULL,
    "external_id" text NOT NULL,
    "email" text NULL,
    "data" jsonb NOT NULL DEFAULT '{}'::jsonb,
    "metadata" jsonb NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "account_holder_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_account_holder_deleted_at" ON "account_holder" (deleted_at) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_account_holder_provider_id_external_id_unique" ON "account_holder" (provider_id, external_id) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS "payment_collection_payment_providers" (
    "payment_collection_id" TEXT NOT NULL,
    "payment_provider_id" TEXT NOT NULL,
    CONSTRAINT "payment_collection_payment_providers_pkey" PRIMARY KEY ("payment_collection_id", "payment_provider_id")
);

CREATE TABLE IF NOT EXISTS "payment_session" (
    "id" TEXT NOT NULL,
    "currency_code" TEXT NOT NULL,
    "amount" NUMERIC NOT NULL,
    "raw_amount" JSONB NOT NULL,
    "provider_id" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "context" JSONB NULL,
    "status" TEXT CHECK ("status" IN ('authorized','pending','requires_more','error','canceled')) NOT NULL DEFAULT 'pending',
    "authorized_at" TIMESTAMPTZ NULL,
    "payment_collection_id" TEXT NOT NULL,
    "metadata" JSONB NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "deleted_at" TIMESTAMPTZ NULL,
    CONSTRAINT "payment_session_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_payment_session_payment_collection_id" ON "payment_session" ("payment_collection_id") WHERE "deleted_at" IS NULL;

CREATE TABLE IF NOT EXISTS "payment" (
    "id" TEXT NOT NULL,
    "amount" NUMERIC NOT NULL,
    "raw_amount" JSONB NOT NULL,
    "currency_code" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "cart_id" TEXT NULL,
    "order_id" TEXT NULL,
    "customer_id" TEXT NULL,
    "data" JSONB NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "deleted_at" TIMESTAMPTZ NULL,
    "captured_at" TIMESTAMPTZ NULL,
    "canceled_at" TIMESTAMPTZ NULL,
    "payment_collection_id" TEXT NOT NULL,
    "payment_session_id" TEXT NOT NULL,
    "metadata" JSONB NULL,
    CONSTRAINT "payment_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_payment_deleted_at" ON "payment" ("deleted_at") WHERE "deleted_at" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "IDX_payment_payment_collection_id" ON "payment" ("payment_collection_id") WHERE "deleted_at" IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_payment_provider_id" ON "payment" ("provider_id") WHERE "deleted_at" IS NULL;

CREATE TABLE IF NOT EXISTS "refund_reason" (
    "id" text NOT NULL,
    "label" text NOT NULL,
    "description" text NULL,
    "metadata" jsonb NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "refund_reason_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "refund" (
    "id" TEXT NOT NULL,
    "amount" NUMERIC NOT NULL,
    "raw_amount" JSONB NOT NULL,
    "payment_id" TEXT NOT NULL,
    "refund_reason_id" TEXT NULL,
    "note" TEXT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "deleted_at" TIMESTAMPTZ NULL,
    "created_by" TEXT NULL,
    "metadata" JSONB NULL,
    CONSTRAINT "refund_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_refund_payment_id" ON "refund" ("payment_id") WHERE "deleted_at" IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_refund_deleted_at" ON "refund" ("deleted_at");

CREATE TABLE IF NOT EXISTS "capture" (
    "id" TEXT NOT NULL,
    "amount" NUMERIC NOT NULL,
    "raw_amount" JSONB NOT NULL,
    "payment_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "deleted_at" TIMESTAMPTZ NULL,
    "created_by" TEXT NULL,
    "metadata" JSONB NULL,
    CONSTRAINT "capture_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_capture_payment_id" ON "capture" ("payment_id") WHERE "deleted_at" IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_capture_deleted_at" ON "capture" ("deleted_at");

-- === Foreign Keys ===
ALTER TABLE "payment_collection_payment_providers" ADD CONSTRAINT "payment_collection_payment_providers_payment_coll_aa276_foreign" FOREIGN KEY ("payment_collection_id") REFERENCES "payment_collection" ("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "payment_collection_payment_providers" ADD CONSTRAINT "payment_collection_payment_providers_payment_provider_id_foreign" FOREIGN KEY ("payment_provider_id") REFERENCES "payment_provider" ("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "payment_session" ADD CONSTRAINT "payment_session_payment_collection_id_foreign" FOREIGN KEY ("payment_collection_id") REFERENCES "payment_collection" ("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "payment" ADD CONSTRAINT "payment_payment_collection_id_foreign" FOREIGN KEY ("payment_collection_id") REFERENCES "payment_collection" ("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "capture" ADD CONSTRAINT "capture_payment_id_foreign" FOREIGN KEY ("payment_id") REFERENCES "payment" ("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "refund" ADD CONSTRAINT "refund_payment_id_foreign" FOREIGN KEY ("payment_id") REFERENCES "payment" ("id") ON UPDATE CASCADE ON DELETE CASCADE;
