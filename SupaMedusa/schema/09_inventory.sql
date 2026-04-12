-- SupaMedusa: Inventory Module
-- 100% data model match with Medusa v2
-- Source: packages/modules/inventory/src/migrations/

CREATE TABLE IF NOT EXISTS "inventory_item" (
    "id" text NOT NULL, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL, "sku" text NULL, "origin_country" text NULL, "hs_code" text NULL,
    "mid_code" text NULL, "material" text NULL, "weight" int NULL, "length" int NULL, "height" int NULL,
    "width" int NULL, "requires_shipping" boolean NOT NULL DEFAULT true, "description" text NULL,
    "title" text NULL, "thumbnail" text NULL, "metadata" jsonb NULL,
    CONSTRAINT "inventory_item_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_inventory_item_deleted_at" ON "inventory_item" (deleted_at) WHERE deleted_at IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_inventory_item_sku_unique" ON "inventory_item" (sku);

CREATE TABLE IF NOT EXISTS "inventory_level" (
    "id" text NOT NULL, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL, "inventory_item_id" text NOT NULL, "location_id" text NOT NULL,
    "stocked_quantity" int NOT NULL DEFAULT 0, "reserved_quantity" int NOT NULL DEFAULT 0,
    "incoming_quantity" int NOT NULL DEFAULT 0,
    "raw_stocked_quantity" jsonb NOT NULL, "raw_reserved_quantity" jsonb NOT NULL, "raw_incoming_quantity" jsonb NOT NULL,
    "metadata" jsonb NULL,
    CONSTRAINT "inventory_level_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_inventory_level_deleted_at" ON "inventory_level" (deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS "IDX_inventory_level_inventory_item_id" ON "inventory_level" (inventory_item_id);
CREATE INDEX IF NOT EXISTS "IDX_inventory_level_location_id" ON "inventory_level" (location_id);

CREATE TABLE IF NOT EXISTS "reservation_item" (
    "id" text NOT NULL, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL, "line_item_id" text NULL, "location_id" text NOT NULL,
    "quantity" integer NOT NULL, "raw_quantity" jsonb NOT NULL, "external_id" text NULL, "description" text NULL,
    "created_by" text NULL, "metadata" jsonb NULL, "inventory_item_id" text NOT NULL,
    "allow_backorder" boolean NOT NULL DEFAULT false,
    CONSTRAINT "reservation_item_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_reservation_item_deleted_at" ON "reservation_item" (deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS "IDX_reservation_item_line_item_id" ON "reservation_item" (line_item_id);
CREATE INDEX IF NOT EXISTS "IDX_reservation_item_location_id" ON "reservation_item" (location_id);
CREATE INDEX IF NOT EXISTS "IDX_reservation_item_inventory_item_id" ON "reservation_item" (inventory_item_id);

-- === Foreign Keys ===
ALTER TABLE "inventory_level" ADD CONSTRAINT "inventory_level_inventory_item_id_foreign" FOREIGN KEY ("inventory_item_id") REFERENCES "inventory_item" ("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "reservation_item" ADD CONSTRAINT "reservation_item_inventory_item_id_foreign" FOREIGN KEY ("inventory_item_id") REFERENCES "inventory_item" ("id") ON UPDATE CASCADE ON DELETE CASCADE;
