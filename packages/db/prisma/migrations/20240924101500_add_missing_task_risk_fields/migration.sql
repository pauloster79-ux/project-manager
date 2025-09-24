-- Add missing fields to Task table
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "priority" TEXT NOT NULL DEFAULT 'medium';

-- Add missing fields to Risk table (only if they don't exist)
ALTER TABLE "Risk" ADD COLUMN IF NOT EXISTS "likelihood" TEXT NOT NULL DEFAULT 'medium';
ALTER TABLE "Risk" ADD COLUMN IF NOT EXISTS "impact" TEXT NOT NULL DEFAULT 'medium';
ALTER TABLE "Risk" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'active';
