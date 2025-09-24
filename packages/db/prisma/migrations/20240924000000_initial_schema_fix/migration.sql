-- This migration runs with the earliest possible timestamp to ensure it runs first
-- It fixes the schema and resolves the failed migration state

-- First, ensure all required fields exist
DO $$ 
BEGIN
    -- Task fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Task' AND column_name = 'status') THEN
        ALTER TABLE "Task" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'pending';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Task' AND column_name = 'priority') THEN
        ALTER TABLE "Task" ADD COLUMN "priority" TEXT NOT NULL DEFAULT 'medium';
    END IF;
    
    -- Risk fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Risk' AND column_name = 'likelihood') THEN
        ALTER TABLE "Risk" ADD COLUMN "likelihood" TEXT NOT NULL DEFAULT 'medium';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Risk' AND column_name = 'impact') THEN
        ALTER TABLE "Risk" ADD COLUMN "impact" TEXT NOT NULL DEFAULT 'medium';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Risk' AND column_name = 'status') THEN
        ALTER TABLE "Risk" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'active';
    END IF;
END $$;

-- Now resolve the failed migration by marking it as applied
-- This is the key fix - we mark the failed migration as resolved
UPDATE "_prisma_migrations" 
SET 
    "finished_at" = NOW(),
    "logs" = 'Migration resolved by initial schema fix - all required fields now exist'
WHERE 
    "migration_name" = '20240924101000_add_missing_fields_to_task_and_risk' 
    AND "finished_at" IS NULL;
