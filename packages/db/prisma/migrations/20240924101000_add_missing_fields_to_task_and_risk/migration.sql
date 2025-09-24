-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN     "priority" TEXT NOT NULL DEFAULT 'medium';

-- AlterTable
ALTER TABLE "Risk" ADD COLUMN     "description" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "likelihood" TEXT NOT NULL DEFAULT 'medium',
ADD COLUMN     "impact" TEXT NOT NULL DEFAULT 'medium',
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active';
