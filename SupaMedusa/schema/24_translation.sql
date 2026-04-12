-- SupaMedusa: Translation Module
-- 100% data model match with Medusa v2
-- Source: packages/modules/translation/src/migrations/

CREATE TABLE IF NOT EXISTS "locale" (
    "id" text NOT NULL,
    "code" text NOT NULL,
    "name" text NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "locale_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_locale_deleted_at" ON "locale" ("deleted_at") WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_locale_code_unique" ON "locale" ("code") WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS "translation" (
    "id" text NOT NULL,
    "reference_id" text NOT NULL,
    "reference" text NOT NULL,
    "locale_code" text NOT NULL,
    "translations" jsonb NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "translation_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_translation_deleted_at" ON "translation" ("deleted_at") WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_translation_reference_id_locale_code_unique" ON "translation" ("reference_id", "locale_code") WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_translation_reference_id_reference_locale_code" ON "translation" ("reference_id", "reference", "locale_code") WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_translation_reference_locale_code" ON "translation" ("reference", "locale_code") WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_translation_reference_id_reference" ON "translation" ("reference_id", "reference") WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_translation_locale_code" ON "translation" ("locale_code") WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS "translation_settings" (
    "id" text NOT NULL,
    "entity_type" text NOT NULL,
    "fields" jsonb NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "translation_settings_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_translation_settings_deleted_at" ON "translation_settings" ("deleted_at") WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_translation_settings_entity_type_unique" ON "translation_settings" ("entity_type") WHERE deleted_at IS NULL;
