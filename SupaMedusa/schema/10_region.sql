-- SupaMedusa: Region Module
-- 100% data model match with Medusa v2
-- Source: packages/modules/region/src/migrations/

CREATE TABLE IF NOT EXISTS "region" (
    "id" text NOT NULL, "name" text NOT NULL, "currency_code" text NOT NULL,
    "automatic_taxes" BOOLEAN NOT NULL DEFAULT TRUE,
    "metadata" jsonb NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "region_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_region_deleted_at" ON "region" ("deleted_at") WHERE "deleted_at" IS NOT NULL;

CREATE TABLE IF NOT EXISTS "region_country" (
    "iso_2" text NOT NULL, "iso_3" text NOT NULL, "num_code" text NOT NULL,
    "name" text NOT NULL, "display_name" text NOT NULL, "region_id" text NULL,
    CONSTRAINT "region_country_pkey" PRIMARY KEY ("iso_2")
);
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_region_country_region_id_iso_2_unique" ON "region_country" (region_id, iso_2);

ALTER TABLE "region_country" ADD CONSTRAINT "region_country_region_id_foreign" FOREIGN KEY ("region_id") REFERENCES "region" ("id") ON UPDATE CASCADE ON DELETE SET NULL;
