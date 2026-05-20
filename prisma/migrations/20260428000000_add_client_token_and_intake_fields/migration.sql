-- AlterTable: add clientToken and intake fields to events
-- Also drop @unique on stripe_checkout_id (was causing retry issues)

-- Drop the unique constraint on stripe_checkout_id if it exists
DROP INDEX IF EXISTS "events_stripe_checkout_id_key";

-- Add new columns
ALTER TABLE "events"
  ADD COLUMN IF NOT EXISTS "client_token" TEXT,
  ADD COLUMN IF NOT EXISTS "client_name" TEXT,
  ADD COLUMN IF NOT EXISTS "client_email" TEXT,
  ADD COLUMN IF NOT EXISTS "intake_notes" TEXT;

-- Add unique index for client_token (nullable unique)
CREATE UNIQUE INDEX IF NOT EXISTS "events_client_token_key" ON "events"("client_token");
