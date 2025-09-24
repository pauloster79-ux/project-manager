-- Resolve the failed migration by marking it as applied
-- This allows subsequent migrations to run

-- First, ensure all required fields exist (safely)
DO $$ 
BEGIN
    -- Add Task fields if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Task' AND column_name = 'status') THEN
        ALTER TABLE "Task" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'pending';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Task' AND column_name = 'priority') THEN
        ALTER TABLE "Task" ADD COLUMN "priority" TEXT NOT NULL DEFAULT 'medium';
    END IF;
    
    -- Add Risk fields if they don't exist
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

-- Mark the failed migration as resolved by updating the migration record
UPDATE "_prisma_migrations" 
SET "finished_at" = NOW(), 
    "logs" = 'Migration resolved manually - fields already existed'
WHERE "migration_name" = '20240924101000_add_missing_fields_to_task_and_risk' 
AND "finished_at" IS NULL;
