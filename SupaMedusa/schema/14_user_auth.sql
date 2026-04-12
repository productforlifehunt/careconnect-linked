-- SupaMedusa: User & Auth Module
-- 100% data model match with Medusa v2
-- Source: packages/modules/user + auth migrations

-- === User ===

CREATE TABLE IF NOT EXISTS "user" (
    "id" text NOT NULL,
    "first_name" text NULL,
    "last_name" text NULL,
    "email" text NOT NULL,
    "avatar_url" text NULL,
    "metadata" jsonb NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_user_email" ON "user" (email) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_user_deleted_at" ON "user" (deleted_at) WHERE deleted_at IS NOT NULL;

CREATE TABLE IF NOT EXISTS "invite" (
    "id" text NOT NULL,
    "email" text NOT NULL,
    "accepted" boolean NOT NULL DEFAULT false,
    "token" text NOT NULL,
    "expires_at" timestamptz NOT NULL,
    "metadata" jsonb NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "invite_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_invite_email" ON "invite" (email) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_invite_token" ON "invite" (token) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_invite_deleted_at" ON "invite" (deleted_at) WHERE deleted_at IS NOT NULL;

-- === Auth ===

CREATE TABLE IF NOT EXISTS "auth_identity" (
    "id" text NOT NULL,
    "app_metadata" jsonb NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT "auth_identity_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "provider_identity" (
    "id" text NOT NULL,
    "entity_id" text NOT NULL,
    "provider" text NOT NULL,
    "auth_identity_id" text NOT NULL,
    "user_metadata" jsonb NULL,
    "provider_metadata" jsonb NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT "provider_identity_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_provider_identity_auth_identity_id" ON "provider_identity" (auth_identity_id);
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_provider_identity_provider_entity_id" ON "provider_identity" (entity_id, provider);

ALTER TABLE "provider_identity" ADD CONSTRAINT "provider_identity_auth_identity_id_foreign" FOREIGN KEY ("auth_identity_id") REFERENCES "auth_identity" ("id") ON UPDATE CASCADE ON DELETE CASCADE;
