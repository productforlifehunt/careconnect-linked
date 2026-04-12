-- SupaMedusa: Customer Module
-- 100% data model match with Medusa v2
-- Source: packages/modules/customer/src/migrations/Migration20240124154000.ts + subsequent migrations

CREATE TABLE IF NOT EXISTS "customer" (
    "id" text NOT NULL,
    "company_name" text NULL,
    "first_name" text NULL,
    "last_name" text NULL,
    "email" text NULL,
    "phone" text NULL,
    "has_account" boolean NOT NULL DEFAULT false,
    "metadata" jsonb NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    "created_by" text NULL,
    CONSTRAINT "customer_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_customer_email_has_account_unique" ON "customer" (email, has_account) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS "customer_address" (
    "id" text NOT NULL,
    "customer_id" text NOT NULL,
    "address_name" text NULL,
    "is_default_shipping" boolean NOT NULL DEFAULT false,
    "is_default_billing" boolean NOT NULL DEFAULT false,
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
    CONSTRAINT "customer_address_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_customer_address_customer_id" ON "customer_address" ("customer_id");
CREATE UNIQUE INDEX "IDX_customer_address_unique_customer_billing" ON "customer_address" ("customer_id") WHERE "is_default_billing" = true;
CREATE UNIQUE INDEX "IDX_customer_address_unique_customer_shipping" ON "customer_address" ("customer_id") WHERE "is_default_shipping" = true;

ALTER TABLE "customer_address" ADD CONSTRAINT "customer_address_customer_id_foreign" FOREIGN KEY ("customer_id") REFERENCES "customer" ("id") ON UPDATE CASCADE ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS "customer_group" (
    "id" text NOT NULL,
    "name" text NULL,
    "metadata" jsonb NULL,
    "created_by" text NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "customer_group_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_customer_group_name" ON "customer_group" ("name") WHERE "deleted_at" IS NULL;

CREATE TABLE IF NOT EXISTS "customer_group_customer" (
    "id" text NOT NULL,
    "customer_id" text NOT NULL,
    "customer_group_id" text NOT NULL,
    "metadata" jsonb NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "created_by" text NULL,
    "deleted_at" timestamptz NULL,
    CONSTRAINT "customer_group_customer_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_customer_group_customer_group_id" ON "customer_group_customer" ("customer_group_id");
CREATE INDEX IF NOT EXISTS "IDX_customer_group_customer_customer_id" ON "customer_group_customer" ("customer_id");

ALTER TABLE "customer_group_customer" ADD CONSTRAINT "customer_group_customer_customer_group_id_foreign" FOREIGN KEY ("customer_group_id") REFERENCES "customer_group" ("id") ON DELETE CASCADE;
ALTER TABLE "customer_group_customer" ADD CONSTRAINT "customer_group_customer_customer_id_foreign" FOREIGN KEY ("customer_id") REFERENCES "customer" ("id") ON DELETE CASCADE;
