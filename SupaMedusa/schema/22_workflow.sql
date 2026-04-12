-- SupaMedusa: Workflow Engine Module
-- 100% data model match with Medusa v2
-- Source: packages/modules/workflow-engine-inmemory/src/migrations/

CREATE TABLE IF NOT EXISTS "workflow_execution" (
    "id" character varying NOT NULL,
    "workflow_id" character varying NOT NULL,
    "transaction_id" character varying NOT NULL,
    "execution" jsonb NULL,
    "context" jsonb NULL,
    "state" text NOT NULL,
    "retention_time" integer NULL,
    "run_id" text NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "deleted_at" timestamptz NULL,
    CONSTRAINT "PK_workflow_execution_workflow_id_transaction_id" PRIMARY KEY ("workflow_id", "transaction_id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_workflow_execution_id" ON "workflow_execution" ("id");
CREATE INDEX IF NOT EXISTS "IDX_workflow_execution_workflow_id" ON "workflow_execution" ("workflow_id") WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_workflow_execution_transaction_id" ON "workflow_execution" ("transaction_id") WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_workflow_execution_state" ON "workflow_execution" ("state") WHERE deleted_at IS NULL;
