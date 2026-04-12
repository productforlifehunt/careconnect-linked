-- SupaMedusa: Currency Module
-- 100% data model match with Medusa v2
-- Source: packages/modules/currency model + migrations

CREATE TABLE IF NOT EXISTS "currency" (
    "code" text NOT NULL,
    "symbol" text NOT NULL,
    "symbol_native" text NOT NULL,
    "name" text NOT NULL,
    "decimal_digits" integer NOT NULL DEFAULT 0,
    "rounding" numeric NOT NULL DEFAULT 0,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "currency_pkey" PRIMARY KEY ("code")
);
