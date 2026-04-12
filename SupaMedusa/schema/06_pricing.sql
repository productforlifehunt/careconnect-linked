-- SupaMedusa: Pricing Module
-- 100% data model match with Medusa v2
-- Source: packages/modules/pricing/src/migrations/

CREATE TABLE IF NOT EXISTS "price_set" (
    "id" text NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "price_set_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_price_set_deleted_at" ON "price_set" (deleted_at) WHERE deleted_at IS NOT NULL;

CREATE TABLE IF NOT EXISTS "rule_type" (
    "id" text NOT NULL,
    "name" text NOT NULL,
    "rule_attribute" text NOT NULL,
    "default_priority" integer NOT NULL DEFAULT 0,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "rule_type_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_rule_type_rule_attribute" ON "rule_type" (rule_attribute) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS "IDX_rule_type_deleted_at" ON "rule_type" (deleted_at) WHERE deleted_at IS NOT NULL;

CREATE TABLE IF NOT EXISTS "price" (
    "id" text NOT NULL,
    "title" text,
    "price_set_id" text NOT NULL,
    "currency_code" text NOT NULL,
    "raw_amount" jsonb NOT NULL,
    "rules_count" integer NOT NULL DEFAULT 0,
    "amount" numeric NOT NULL,
    "min_quantity" numeric NULL,
    "max_quantity" numeric NULL,
    "raw_min_quantity" jsonb NULL,
    "raw_max_quantity" jsonb NULL,
    "price_list_id" text NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "price_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_price_price_set_id" ON "price" (price_set_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_price_currency_code" ON "price" (currency_code) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_price_price_list_id" ON "price" (price_list_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_price_deleted_at" ON "price" (deleted_at) WHERE deleted_at IS NOT NULL;

CREATE TABLE IF NOT EXISTS "price_set_rule_type" (
    "id" text NOT NULL,
    "price_set_id" text NOT NULL,
    "rule_type_id" text NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "price_set_rule_type_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_price_set_rule_type_price_set_id" ON "price_set_rule_type" (price_set_id) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS "IDX_price_set_rule_type_rule_type_id" ON "price_set_rule_type" (rule_type_id) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS "IDX_price_set_rule_type_deleted_at" ON "price_set_rule_type" (deleted_at) WHERE deleted_at IS NOT NULL;

CREATE TABLE IF NOT EXISTS "price_rule" (
    "id" text NOT NULL,
    "price_set_id" text NOT NULL,
    "rule_type_id" text NOT NULL,
    "value" text NOT NULL,
    "attribute" text NOT NULL DEFAULT '',
    "operator" text CHECK ("operator" IN ('gte','lte','gt','lt','eq')) NULL,
    "priority" integer NOT NULL DEFAULT 0,
    "price_id" text NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "price_rule_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_price_rule_price_set_id" ON "price_rule" (price_set_id) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS "IDX_price_rule_rule_type_id" ON "price_rule" (rule_type_id) WHERE deleted_at IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_price_rule_price_id_unique" ON "price_rule" (price_id) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS "IDX_price_rule_deleted_at" ON "price_rule" (deleted_at) WHERE deleted_at IS NOT NULL;

CREATE TABLE IF NOT EXISTS "price_list" (
    "id" text NOT NULL,
    "status" text CHECK ("status" IN ('active','draft')) NOT NULL DEFAULT 'draft',
    "starts_at" timestamptz NULL,
    "ends_at" timestamptz NULL,
    "rules_count" integer NOT NULL DEFAULT 0,
    "title" text NOT NULL,
    "description" text NOT NULL,
    "type" text CHECK ("type" IN ('sale','override')) NOT NULL DEFAULT 'sale',
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "price_list_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_price_list_deleted_at" ON "price_list" (deleted_at) WHERE deleted_at IS NOT NULL;

CREATE TABLE IF NOT EXISTS "price_list_rule" (
    "id" text NOT NULL,
    "rule_type_id" text NOT NULL,
    "price_list_id" text NOT NULL,
    "attribute" text NOT NULL DEFAULT '',
    "value" jsonb NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "price_list_rule_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_price_list_rule_rule_type_id_unique" ON "price_list_rule" (rule_type_id) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS "IDX_price_list_rule_price_list_id" ON "price_list_rule" (price_list_id) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS "IDX_price_list_rule_deleted_at" ON "price_list_rule" (deleted_at) WHERE deleted_at IS NOT NULL;

CREATE TABLE IF NOT EXISTS "price_list_rule_value" (
    "id" text NOT NULL,
    "value" text NOT NULL,
    "price_list_rule_id" text NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "price_list_rule_value_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_price_list_rule_value_price_list_rule_id" ON "price_list_rule_value" (price_list_rule_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_price_list_rule_value_deleted_at" ON "price_list_rule_value" (deleted_at) WHERE deleted_at IS NOT NULL;

CREATE TABLE IF NOT EXISTS "price_preference" (
    "id" text NOT NULL,
    "attribute" text NOT NULL,
    "value" text NULL,
    "is_tax_inclusive" boolean NOT NULL DEFAULT false,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "price_preference_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_price_preference_deleted_at" ON "price_preference" (deleted_at) WHERE deleted_at IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_price_preference_attribute_value" ON "price_preference" (attribute, value) WHERE deleted_at IS NULL;

-- === Foreign Keys ===
ALTER TABLE "price" ADD CONSTRAINT "price_price_set_id_foreign" FOREIGN KEY ("price_set_id") REFERENCES "price_set" ("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "price" ADD CONSTRAINT "price_price_list_id_foreign" FOREIGN KEY ("price_list_id") REFERENCES "price_list" ("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "price_set_rule_type" ADD CONSTRAINT "price_set_rule_type_price_set_id_foreign" FOREIGN KEY ("price_set_id") REFERENCES "price_set" ("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "price_set_rule_type" ADD CONSTRAINT "price_set_rule_type_rule_type_id_foreign" FOREIGN KEY ("rule_type_id") REFERENCES "rule_type" ("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "price_rule" ADD CONSTRAINT "price_rule_price_set_id_foreign" FOREIGN KEY ("price_set_id") REFERENCES "price_set" ("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "price_rule" ADD CONSTRAINT "price_rule_rule_type_id_foreign" FOREIGN KEY ("rule_type_id") REFERENCES "rule_type" ("id") ON UPDATE CASCADE;
ALTER TABLE "price_rule" ADD CONSTRAINT "price_rule_price_id_foreign" FOREIGN KEY ("price_id") REFERENCES "price" ("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "price_list_rule" ADD CONSTRAINT "price_list_rule_rule_type_id_foreign" FOREIGN KEY ("rule_type_id") REFERENCES "rule_type" ("id") ON UPDATE CASCADE;
ALTER TABLE "price_list_rule" ADD CONSTRAINT "price_list_rule_price_list_id_foreign" FOREIGN KEY ("price_list_id") REFERENCES "price_list" ("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "price_list_rule_value" ADD CONSTRAINT "price_list_rule_value_price_list_rule_id_foreign" FOREIGN KEY ("price_list_rule_id") REFERENCES "price_list_rule" ("id") ON UPDATE CASCADE ON DELETE CASCADE;
