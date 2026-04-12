-- SupaMedusa: Required PostgreSQL Extensions
-- Enable any extensions needed by the schema

-- For UUID generation (used by Medusa ID generation if needed)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- For JSONB path queries
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
