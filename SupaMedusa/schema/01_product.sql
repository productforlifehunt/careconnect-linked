-- SupaMedusa: Product Module
-- 100% data model match with Medusa v2
-- Source: packages/modules/product/src/migrations/InitialSetup20240401153642.ts + subsequent migrations

-- === ENTITY TABLES ===

CREATE TABLE IF NOT EXISTS "product_type" (
    "id" text NOT NULL,
    "value" text NOT NULL,
    "metadata" jsonb NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "product_type_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_type_value_unique" ON "product_type" (value) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_product_type_deleted_at" ON "product_type" ("deleted_at");

CREATE TABLE IF NOT EXISTS "product_collection" (
    "id" text NOT NULL,
    "title" text NOT NULL,
    "handle" text NOT NULL,
    "metadata" jsonb NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "product_collection_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_collection_handle_unique" ON "product_collection" (handle) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_product_collection_deleted_at" ON "product_collection" ("deleted_at");

CREATE TABLE IF NOT EXISTS "product" (
    "id" text NOT NULL,
    "title" text NOT NULL,
    "handle" text NOT NULL,
    "subtitle" text NULL,
    "description" text NULL,
    "is_giftcard" boolean NOT NULL DEFAULT false,
    "status" text CHECK ("status" IN ('draft', 'proposed', 'published', 'rejected')) NOT NULL,
    "thumbnail" text NULL,
    "weight" text NULL,
    "length" text NULL,
    "height" text NULL,
    "width" text NULL,
    "origin_country" text NULL,
    "hs_code" text NULL,
    "mid_code" text NULL,
    "material" text NULL,
    "collection_id" text NULL,
    "type_id" text NULL,
    "discountable" boolean NOT NULL DEFAULT true,
    "external_id" text NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    "metadata" jsonb NULL,
    CONSTRAINT "product_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_product_handle_unique" ON "product" (handle) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_product_type_id" ON "product" ("type_id") WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_product_collection_id" ON "product" ("collection_id") WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_product_deleted_at" ON "product" ("deleted_at");

CREATE TABLE IF NOT EXISTS "product_variant" (
    "id" text NOT NULL,
    "title" text NOT NULL,
    "sku" text NULL,
    "barcode" text NULL,
    "ean" text NULL,
    "upc" text NULL,
    "allow_backorder" boolean NOT NULL DEFAULT false,
    "manage_inventory" boolean NOT NULL DEFAULT true,
    "hs_code" text NULL,
    "origin_country" text NULL,
    "mid_code" text NULL,
    "material" text NULL,
    "weight" numeric NULL,
    "length" numeric NULL,
    "height" numeric NULL,
    "width" numeric NULL,
    "metadata" jsonb NULL,
    "variant_rank" numeric NULL DEFAULT 0,
    "thumbnail" text NULL,
    "product_id" text NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "product_variant_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_product_variant_ean_unique" ON "product_variant" (ean) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_product_variant_upc_unique" ON "product_variant" (upc) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_product_variant_sku_unique" ON "product_variant" (sku) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_product_variant_barcode_unique" ON "product_variant" (barcode) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_product_variant_product_id" ON "product_variant" ("product_id") WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_product_variant_deleted_at" ON "product_variant" ("deleted_at");

CREATE TABLE IF NOT EXISTS "product_option" (
    "id" text NOT NULL,
    "title" text NOT NULL,
    "product_id" text NULL,
    "metadata" jsonb NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "product_option_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_option_product_id_title_unique" ON "product_option" (product_id, title) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_product_option_deleted_at" ON "product_option" ("deleted_at");

CREATE TABLE IF NOT EXISTS "product_option_value" (
    "id" text NOT NULL,
    "value" text NOT NULL,
    "option_id" text NULL,
    "metadata" jsonb NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "product_option_value_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_option_value_option_id_unique" ON "product_option_value" (option_id, value) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_product_option_value_deleted_at" ON "product_option_value" ("deleted_at");

CREATE TABLE IF NOT EXISTS "image" (
    "id" text NOT NULL,
    "url" text NOT NULL,
    "rank" integer NOT NULL DEFAULT 0,
    "product_id" text NOT NULL,
    "metadata" jsonb NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "image_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_product_image_url" ON "image" ("url") WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_product_image_deleted_at" ON "image" ("deleted_at");

CREATE TABLE IF NOT EXISTS "product_tag" (
    "id" text NOT NULL,
    "value" text NOT NULL,
    "metadata" jsonb NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "product_tag_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_tag_value_unique" ON "product_tag" (value) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_product_tag_deleted_at" ON "product_tag" ("deleted_at");

CREATE TABLE IF NOT EXISTS "product_category" (
    "id" text NOT NULL,
    "name" text NOT NULL,
    "description" text NOT NULL DEFAULT '',
    "handle" text NOT NULL,
    "mpath" text NOT NULL,
    "is_active" boolean NOT NULL DEFAULT false,
    "is_internal" boolean NOT NULL DEFAULT false,
    "rank" numeric NOT NULL DEFAULT 0,
    "parent_category_id" text NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    "metadata" jsonb NULL,
    CONSTRAINT "product_category_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_category_handle_unique" ON "product_category" (handle) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_product_category_path" ON "product_category" ("mpath") WHERE deleted_at IS NULL;

-- === PIVOT TABLES ===

CREATE TABLE IF NOT EXISTS "product_tags" (
    "product_id" text NOT NULL,
    "product_tag_id" text NOT NULL,
    CONSTRAINT "product_tags_pkey" PRIMARY KEY ("product_id", "product_tag_id")
);

CREATE TABLE IF NOT EXISTS "product_variant_product_image" (
    "id" text NOT NULL,
    "variant_id" text NOT NULL,
    "image_id" text NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "product_variant_product_image_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_product_variant_product_image_variant_id" ON "product_variant_product_image" (variant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_product_variant_product_image_image_id" ON "product_variant_product_image" (image_id) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS "product_category_product" (
    "product_id" text NOT NULL,
    "product_category_id" text NOT NULL,
    CONSTRAINT "product_category_product_pkey" PRIMARY KEY ("product_id", "product_category_id")
);

CREATE TABLE IF NOT EXISTS "product_variant_option" (
    "variant_id" text NOT NULL,
    "option_value_id" text NOT NULL,
    CONSTRAINT "product_variant_option_pkey" PRIMARY KEY ("variant_id", "option_value_id")
);

-- === FOREIGN KEYS ===

ALTER TABLE "product" ADD CONSTRAINT "product_collection_id_foreign" FOREIGN KEY ("collection_id") REFERENCES "product_collection" ("id") ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE "product" ADD CONSTRAINT "product_type_id_foreign" FOREIGN KEY ("type_id") REFERENCES "product_type" ("id") ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE "product_variant" ADD CONSTRAINT "product_variant_product_id_foreign" FOREIGN KEY ("product_id") REFERENCES "product" ("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "product_option" ADD CONSTRAINT "product_option_product_id_foreign" FOREIGN KEY ("product_id") REFERENCES "product" ("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "product_option_value" ADD CONSTRAINT "product_option_value_option_id_foreign" FOREIGN KEY ("option_id") REFERENCES "product_option" ("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "product_variant_option" ADD CONSTRAINT "product_variant_option_variant_id_foreign" FOREIGN KEY ("variant_id") REFERENCES "product_variant" ("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "product_variant_option" ADD CONSTRAINT "product_variant_option_option_value_id_foreign" FOREIGN KEY ("option_value_id") REFERENCES "product_option_value" ("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "image" ADD CONSTRAINT "image_product_id_foreign" FOREIGN KEY ("product_id") REFERENCES "product" ("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "product_variant_product_image" ADD CONSTRAINT "product_variant_product_image_image_id_foreign" FOREIGN KEY ("image_id") REFERENCES "image" ("id") ON DELETE CASCADE;
ALTER TABLE "product_tags" ADD CONSTRAINT "product_tags_product_id_foreign" FOREIGN KEY ("product_id") REFERENCES "product" ("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "product_tags" ADD CONSTRAINT "product_tags_product_tag_id_foreign" FOREIGN KEY ("product_tag_id") REFERENCES "product_tag" ("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "product_category_product" ADD CONSTRAINT "product_category_product_product_id_foreign" FOREIGN KEY ("product_id") REFERENCES "product" ("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "product_category_product" ADD CONSTRAINT "product_category_product_product_category_id_foreign" FOREIGN KEY ("product_category_id") REFERENCES "product_category" ("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "product_category" ADD CONSTRAINT "product_category_parent_category_id_foreign" FOREIGN KEY ("parent_category_id") REFERENCES "product_category" ("id") ON UPDATE CASCADE ON DELETE CASCADE;
