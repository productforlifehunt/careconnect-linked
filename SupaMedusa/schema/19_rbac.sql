-- SupaMedusa: RBAC Module
-- 100% data model match with Medusa v2
-- Source: packages/modules/rbac/src/migrations/

CREATE TABLE IF NOT EXISTS "rbac_policy" (
    "id" text NOT NULL, "key" text NOT NULL, "resource" text NOT NULL, "operation" text NOT NULL,
    "name" text NULL, "description" text NULL, "metadata" jsonb NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "rbac_policy_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_rbac_policy_deleted_at" ON "rbac_policy" ("deleted_at") WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_rbac_policy_key_unique" ON "rbac_policy" ("key") WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_rbac_policy_resource" ON "rbac_policy" ("resource") WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_rbac_policy_operation" ON "rbac_policy" ("operation") WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS "rbac_role" (
    "id" text NOT NULL, "name" text NOT NULL, "description" text NULL, "metadata" jsonb NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "rbac_role_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_rbac_role_deleted_at" ON "rbac_role" ("deleted_at") WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_rbac_role_name_unique" ON "rbac_role" ("name") WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS "rbac_role_parent" (
    "id" text NOT NULL, "role_id" text NOT NULL, "parent_id" text NOT NULL, "metadata" jsonb NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "rbac_role_parent_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_rbac_role_parent_role_id" ON "rbac_role_parent" ("role_id") WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_rbac_role_parent_parent_id" ON "rbac_role_parent" ("parent_id") WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_rbac_role_parent_deleted_at" ON "rbac_role_parent" ("deleted_at") WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_rbac_role_parent_role_id_parent_id_unique" ON "rbac_role_parent" ("role_id", "parent_id") WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS "rbac_role_policy" (
    "id" text NOT NULL, "role_id" text NOT NULL, "policy_id" text NOT NULL, "metadata" jsonb NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "rbac_role_policy_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_rbac_role_policy_role_id" ON "rbac_role_policy" ("role_id") WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_rbac_role_policy_policy_id" ON "rbac_role_policy" ("policy_id") WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_rbac_role_policy_deleted_at" ON "rbac_role_policy" ("deleted_at") WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_rbac_role_policy_role_id_policy_id_unique" ON "rbac_role_policy" ("role_id", "policy_id") WHERE deleted_at IS NULL;

-- === Foreign Keys ===
ALTER TABLE "rbac_role_parent" ADD CONSTRAINT "rbac_role_parent_role_id_foreign" FOREIGN KEY ("role_id") REFERENCES "rbac_role" ("id") ON UPDATE CASCADE;
ALTER TABLE "rbac_role_parent" ADD CONSTRAINT "rbac_role_parent_parent_id_foreign" FOREIGN KEY ("parent_id") REFERENCES "rbac_role" ("id") ON UPDATE CASCADE;
ALTER TABLE "rbac_role_policy" ADD CONSTRAINT "rbac_role_policy_role_id_foreign" FOREIGN KEY ("role_id") REFERENCES "rbac_role" ("id") ON UPDATE CASCADE;
ALTER TABLE "rbac_role_policy" ADD CONSTRAINT "rbac_role_policy_policy_id_foreign" FOREIGN KEY ("policy_id") REFERENCES "rbac_policy" ("id") ON UPDATE CASCADE;
