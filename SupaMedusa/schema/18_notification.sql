-- SupaMedusa: Notification Module
-- 100% data model match with Medusa v2
-- Source: packages/modules/notification/src/migrations/

CREATE TABLE IF NOT EXISTS "notification_provider" (
    "id" text NOT NULL,
    "handle" text NOT NULL,
    "name" text NOT NULL,
    "is_enabled" boolean NOT NULL DEFAULT true,
    "channels" text[] NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "notification_provider_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "notification" (
    "id" text NOT NULL,
    "to" text NOT NULL,
    "channel" text NOT NULL,
    "template" text NOT NULL,
    "data" jsonb NULL,
    "trigger_type" text NULL,
    "resource_id" text NULL,
    "resource_type" text NULL,
    "receiver_id" text NULL,
    "original_notification_id" text NULL,
    "idempotency_key" text NULL,
    "external_id" text NULL,
    "provider_id" text NULL,
    "status" text CHECK ("status" IN ('pending','success','failure')) NOT NULL DEFAULT 'pending',
    "from" text NULL,
    "provider_data" jsonb NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_notification_provider_id" ON "notification" (provider_id);
CREATE INDEX IF NOT EXISTS "IDX_notification_idempotency_key" ON "notification" (idempotency_key);
CREATE INDEX IF NOT EXISTS "IDX_notification_receiver_id" ON "notification" (receiver_id);

ALTER TABLE "notification" ADD CONSTRAINT "notification_provider_id_foreign" FOREIGN KEY ("provider_id") REFERENCES "notification_provider" ("id") ON UPDATE CASCADE ON DELETE SET NULL;
