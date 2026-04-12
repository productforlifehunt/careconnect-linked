-- SupaMedusa: Tax Module
-- 100% data model match with Medusa v2
-- Source: packages/modules/tax/src/migrations/

CREATE TABLE IF NOT EXISTS "tax_provider" (
    "id" text NOT NULL, "is_enabled" boolean NOT NULL DEFAULT true,
    "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "tax_provider_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "tax_region" (
    "id" text NOT NULL, "provider_id" text NULL, "country_code" text NOT NULL,
    "province_code" text NULL, "parent_id" text NULL, "metadata" jsonb NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(),
    "created_by" text NULL, "deleted_at" timestamptz NULL,
    CONSTRAINT "tax_region_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "CK_tax_region_country_top_level" CHECK (parent_id IS NULL OR province_code IS NOT NULL),
    CONSTRAINT "CK_tax_region_provider_top_level" CHECK (parent_id IS NULL OR provider_id IS NULL)
);
CREATE INDEX IF NOT EXISTS "IDX_tax_region_parent_id" ON "tax_region" ("parent_id");
CREATE INDEX IF NOT EXISTS "IDX_tax_region_deleted_at" ON "tax_region" ("deleted_at") WHERE deleted_at IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_tax_region_unique_country_province" ON "tax_region" ("country_code", "province_code");

CREATE TABLE IF NOT EXISTS "tax_rate" (
    "id" text NOT NULL, "rate" real NULL, "code" text NULL, "name" text NOT NULL,
    "is_default" bool NOT NULL DEFAULT false, "is_combinable" bool NOT NULL DEFAULT false,
    "tax_region_id" text NOT NULL, "metadata" jsonb NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(),
    "created_by" text NULL, "deleted_at" timestamptz NULL,
    CONSTRAINT "tax_rate_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_tax_rate_tax_region_id" ON "tax_rate" ("tax_region_id") WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_tax_rate_deleted_at" ON "tax_rate" ("deleted_at") WHERE deleted_at IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_single_default_region" ON "tax_rate" ("tax_region_id") WHERE is_default = true AND deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS "tax_rate_rule" (
    "id" text NOT NULL, "tax_rate_id" text NOT NULL, "reference_id" text NOT NULL,
    "reference" text NOT NULL, "metadata" jsonb NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(),
    "created_by" text NULL, "deleted_at" timestamptz NULL,
    CONSTRAINT "tax_rate_rule_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_tax_rate_rule_tax_rate_id" ON "tax_rate_rule" ("tax_rate_id") WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_tax_rate_rule_reference_id" ON "tax_rate_rule" ("reference_id") WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_tax_rate_rule_deleted_at" ON "tax_rate_rule" ("deleted_at") WHERE deleted_at IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_tax_rate_rule_unique_rate_reference" ON "tax_rate_rule" ("tax_rate_id", "reference_id") WHERE deleted_at IS NULL;

-- === Foreign Keys ===
ALTER TABLE "tax_region" ADD CONSTRAINT "FK_tax_region_provider_id" FOREIGN KEY ("provider_id") REFERENCES "tax_provider" ("id") ON DELETE SET NULL;
ALTER TABLE "tax_region" ADD CONSTRAINT "FK_tax_region_parent_id" FOREIGN KEY ("parent_id") REFERENCES "tax_region" ("id") ON DELETE CASCADE;
ALTER TABLE "tax_rate" ADD CONSTRAINT "FK_tax_rate_tax_region_id" FOREIGN KEY ("tax_region_id") REFERENCES "tax_region" ("id") ON DELETE CASCADE;
ALTER TABLE "tax_rate_rule" ADD CONSTRAINT "FK_tax_rate_rule_tax_rate_id" FOREIGN KEY ("tax_rate_id") REFERENCES "tax_rate" ("id") ON DELETE CASCADE;
