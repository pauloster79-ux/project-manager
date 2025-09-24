-- This migration ensures all required fields exist before the failed migration
-- It uses an earlier timestamp to be applied first

-- Add missing fields to Task table (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Task' AND column_name = 'status') THEN
        ALTER TABLE "Task" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'pending';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Task' AND column_name = 'priority') THEN
        ALTER TABLE "Task" ADD COLUMN "priority" TEXT NOT NULL DEFAULT 'medium';
    END IF;
END $$;

-- Add missing fields to Risk table (only if they don't exist)
DO $$ 
BEGIN
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
