-- SupaMedusa: Index Module
-- 100% data model match with Medusa v2
-- Source: packages/modules/index/src/migrations/
-- Note: index_data and index_relation use PARTITION BY LIST — partitions are created dynamically at runtime.

CREATE TABLE IF NOT EXISTS "index_data" (
    "id" text NOT NULL,
    "name" text NOT NULL,
    "data" jsonb NOT NULL DEFAULT '{}',
    CONSTRAINT "index_data_pkey" PRIMARY KEY ("id", "name")
) PARTITION BY LIST("name");

CREATE TABLE IF NOT EXISTS "index_relation" (
    "id" bigserial,
    "pivot" text NOT NULL,
    "parent_id" text NOT NULL,
    "parent_name" text NOT NULL,
    "child_id" text NOT NULL,
    "child_name" text NOT NULL,
    CONSTRAINT "index_relation_pkey" PRIMARY KEY ("id", "pivot")
) PARTITION BY LIST("pivot");

CREATE TABLE IF NOT EXISTS "index_metadata" (
    "id" text NOT NULL,
    "entity" text NOT NULL,
    "fields" text NOT NULL,
    "fields_hash" text NOT NULL,
    "status" text CHECK ("status" IN ('pending','processing','done','error')) NOT NULL DEFAULT 'pending',
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "index_metadata_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_index_metadata_deleted_at" ON "index_metadata" (deleted_at) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_index_metadata_entity" ON "index_metadata" (entity) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS "index_sync" (
    "id" text NOT NULL,
    "entity" text NOT NULL,
    "last_key" text NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "index_sync_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_index_sync_deleted_at" ON "index_sync" (deleted_at) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_index_sync_entity" ON "index_sync" (entity) WHERE deleted_at IS NULL;
