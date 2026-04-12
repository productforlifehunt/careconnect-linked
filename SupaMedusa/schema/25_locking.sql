-- SupaMedusa: Locking Module (Postgres Provider)
-- 100% data model match with Medusa v2
-- Source: packages/modules/providers/locking-postgres/src/migrations/

CREATE TABLE IF NOT EXISTS "locking" (
    "id" text NOT NULL,
    "owner_id" text NULL,
    "expiration" timestamptz NULL,
    CONSTRAINT "locking_pkey" PRIMARY KEY ("id")
);
