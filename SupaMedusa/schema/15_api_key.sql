-- SupaMedusa: API Key Module
-- 100% data model match with Medusa v2
-- Source: packages/modules/api-key model + migrations

CREATE TABLE IF NOT EXISTS "api_key" (
    "id" text NOT NULL,
    "token" text NOT NULL,
    "salt" text NOT NULL,
    "redacted" text NOT NULL,
    "title" text NOT NULL,
    "type" text CHECK ("type" IN ('publishable','secret')) NOT NULL,
    "last_used_at" timestamptz NULL,
    "created_by" text NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "revoked_by" text NULL,
    "revoked_at" timestamptz NULL,
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT "api_key_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_api_key_type" ON "api_key" ("type");
CREATE INDEX IF NOT EXISTS "IDX_api_key_token" ON "api_key" ("token");
