-- SupaMedusa: Promotion Module
-- 100% data model match with Medusa v2
-- Source: packages/modules/promotion/src/migrations/

CREATE TABLE IF NOT EXISTS "promotion_campaign" (
    "id" text NOT NULL,
    "name" text NOT NULL,
    "description" text NULL,
    "campaign_identifier" text NOT NULL,
    "starts_at" timestamptz NULL,
    "ends_at" timestamptz NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "promotion_campaign_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "IDX_campaign_identifier_unique" UNIQUE ("campaign_identifier")
);

CREATE TABLE IF NOT EXISTS "promotion_campaign_budget" (
    "id" text NOT NULL,
    "type" text CHECK ("type" IN ('spend','usage','use_by_attribute','spend_by_attribute')) NOT NULL,
    "campaign_id" text NOT NULL,
    "limit" numeric NULL,
    "raw_limit" jsonb NULL,
    "used" numeric NOT NULL DEFAULT 0,
    "raw_used" jsonb NOT NULL,
    "currency_code" text NULL,
    "attribute" text NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "promotion_campaign_budget_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "promotion_campaign_budget_campaign_id_unique" UNIQUE ("campaign_id")
);
CREATE INDEX IF NOT EXISTS "IDX_campaign_budget_type" ON "promotion_campaign_budget" ("type");

CREATE TABLE IF NOT EXISTS "promotion_campaign_budget_usage" (
    "id" text NOT NULL,
    "attribute_value" text NOT NULL,
    "used" numeric NOT NULL DEFAULT 0,
    "budget_id" text NOT NULL,
    "raw_used" jsonb NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "promotion_campaign_budget_usage_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_promotion_campaign_budget_usage_budget_id" ON "promotion_campaign_budget_usage" (budget_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_promotion_campaign_budget_usage_deleted_at" ON "promotion_campaign_budget_usage" (deleted_at) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_promotion_campaign_budget_usage_attribute_value_budget_id_unique" ON "promotion_campaign_budget_usage" (attribute_value, budget_id) WHERE deleted_at IS NULL;
ALTER TABLE "promotion_campaign_budget_usage" ADD CONSTRAINT "promotion_campaign_budget_usage_budget_id_foreign" FOREIGN KEY ("budget_id") REFERENCES "promotion_campaign_budget" ("id") ON UPDATE CASCADE ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS "promotion" (
    "id" text NOT NULL,
    "code" text NOT NULL,
    "campaign_id" text NULL,
    "is_automatic" boolean NOT NULL DEFAULT false,
    "type" text CHECK ("type" IN ('standard','buyget')) NOT NULL,
    "status" text CHECK ("status" IN ('draft','active','inactive')) NOT NULL DEFAULT 'draft',
    "is_tax_inclusive" boolean NOT NULL DEFAULT false,
    "limit" integer NULL,
    "used" integer NOT NULL DEFAULT 0,
    "metadata" jsonb NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "promotion_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "IDX_promotion_code_unique" UNIQUE ("code")
);
CREATE INDEX IF NOT EXISTS "IDX_promotion_code" ON "promotion" ("code");
CREATE INDEX IF NOT EXISTS "IDX_promotion_type" ON "promotion" ("type");

CREATE TABLE IF NOT EXISTS "promotion_application_method" (
    "id" text NOT NULL,
    "value" numeric NULL,
    "raw_value" jsonb NOT NULL,
    "max_quantity" numeric NULL,
    "apply_to_quantity" numeric NULL,
    "buy_rules_min_quantity" numeric NULL,
    "type" text CHECK ("type" IN ('fixed','percentage')) NOT NULL,
    "target_type" text CHECK ("target_type" IN ('order','shipping_methods','items')) NOT NULL,
    "allocation" text CHECK ("allocation" IN ('each','across')) NULL,
    "promotion_id" text NOT NULL,
    "currency_code" text NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "promotion_application_method_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "promotion_application_method_promotion_id_unique" UNIQUE ("promotion_id")
);
CREATE INDEX IF NOT EXISTS "IDX_application_method_type" ON "promotion_application_method" ("type");
CREATE INDEX IF NOT EXISTS "IDX_application_method_target_type" ON "promotion_application_method" ("target_type");
CREATE INDEX IF NOT EXISTS "IDX_application_method_allocation" ON "promotion_application_method" ("allocation");
CREATE INDEX IF NOT EXISTS "IDX_promotion_application_method_currency_code" ON "promotion_application_method" (currency_code) WHERE deleted_at IS NOT NULL;

CREATE TABLE IF NOT EXISTS "promotion_rule" (
    "id" text NOT NULL,
    "description" text NULL,
    "attribute" text NOT NULL,
    "operator" text CHECK ("operator" IN ('gte','lte','gt','lt','eq','ne','in')) NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "promotion_rule_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_promotion_rule_attribute" ON "promotion_rule" ("attribute");
CREATE INDEX IF NOT EXISTS "IDX_promotion_rule_operator" ON "promotion_rule" ("operator");

CREATE TABLE IF NOT EXISTS "promotion_rule_value" (
    "id" text NOT NULL,
    "promotion_rule_id" text NOT NULL,
    "value" text NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "promotion_rule_value_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_promotion_rule_promotion_rule_value_id" ON "promotion_rule_value" ("promotion_rule_id");

-- Pivot tables
CREATE TABLE IF NOT EXISTS "promotion_promotion_rule" (
    "promotion_id" text NOT NULL,
    "promotion_rule_id" text NOT NULL,
    CONSTRAINT "promotion_promotion_rule_pkey" PRIMARY KEY ("promotion_id", "promotion_rule_id")
);
CREATE TABLE IF NOT EXISTS "application_method_target_rules" (
    "application_method_id" text NOT NULL,
    "promotion_rule_id" text NOT NULL,
    CONSTRAINT "application_method_target_rules_pkey" PRIMARY KEY ("application_method_id", "promotion_rule_id")
);
CREATE TABLE IF NOT EXISTS "application_method_buy_rules" (
    "application_method_id" text NOT NULL,
    "promotion_rule_id" text NOT NULL,
    CONSTRAINT "application_method_buy_rules_pkey" PRIMARY KEY ("application_method_id", "promotion_rule_id")
);

-- === Foreign Keys ===
ALTER TABLE "promotion_campaign_budget" ADD CONSTRAINT "promotion_campaign_budget_campaign_id_foreign" FOREIGN KEY ("campaign_id") REFERENCES "promotion_campaign" ("id") ON UPDATE CASCADE;
ALTER TABLE "promotion" ADD CONSTRAINT "promotion_campaign_id_foreign" FOREIGN KEY ("campaign_id") REFERENCES "promotion_campaign" ("id") ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE "promotion_application_method" ADD CONSTRAINT "promotion_application_method_promotion_id_foreign" FOREIGN KEY ("promotion_id") REFERENCES "promotion" ("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "promotion_promotion_rule" ADD CONSTRAINT "promotion_promotion_rule_promotion_id_foreign" FOREIGN KEY ("promotion_id") REFERENCES "promotion" ("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "promotion_promotion_rule" ADD CONSTRAINT "promotion_promotion_rule_promotion_rule_id_foreign" FOREIGN KEY ("promotion_rule_id") REFERENCES "promotion_rule" ("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "application_method_target_rules" ADD CONSTRAINT "application_method_target_rules_application_method_id_foreign" FOREIGN KEY ("application_method_id") REFERENCES "promotion_application_method" ("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "application_method_target_rules" ADD CONSTRAINT "application_method_target_rules_promotion_rule_id_foreign" FOREIGN KEY ("promotion_rule_id") REFERENCES "promotion_rule" ("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "application_method_buy_rules" ADD CONSTRAINT "application_method_buy_rules_application_method_id_foreign" FOREIGN KEY ("application_method_id") REFERENCES "promotion_application_method" ("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "application_method_buy_rules" ADD CONSTRAINT "application_method_buy_rules_promotion_rule_id_foreign" FOREIGN KEY ("promotion_rule_id") REFERENCES "promotion_rule" ("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "promotion_rule_value" ADD CONSTRAINT "promotion_rule_value_promotion_rule_id_foreign" FOREIGN KEY ("promotion_rule_id") REFERENCES "promotion_rule" ("id") ON UPDATE CASCADE ON DELETE CASCADE;
