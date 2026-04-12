-- SupaMedusa: Settings Module
-- 100% data model match with Medusa v2
-- Source: packages/modules/settings/src/migrations/

CREATE TABLE IF NOT EXISTS "user_preference" (
    "id" text NOT NULL,
    "user_id" text NOT NULL,
    "key" text NOT NULL,
    "value" jsonb NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "user_preference_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_user_preference_deleted_at" ON "user_preference" (deleted_at) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_user_preference_user_id_key_unique" ON "user_preference" (user_id, key) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_user_preference_user_id" ON "user_preference" (user_id) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS "view_configuration" (
    "id" text NOT NULL,
    "entity" text NOT NULL,
    "name" text NULL,
    "user_id" text NULL,
    "is_system_default" boolean NOT NULL DEFAULT false,
    "configuration" jsonb NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "view_configuration_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_view_configuration_deleted_at" ON "view_configuration" (deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_view_configuration_entity_user_id" ON "view_configuration" (entity, user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_view_configuration_entity_is_system_default" ON "view_configuration" (entity, is_system_default) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_view_configuration_user_id" ON "view_configuration" (user_id) WHERE deleted_at IS NULL;
