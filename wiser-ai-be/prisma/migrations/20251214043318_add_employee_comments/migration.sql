-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "GrowthMapStatus" ADD VALUE 'APPROVED';
ALTER TYPE "GrowthMapStatus" ADD VALUE 'IN_PROGRESS';
ALTER TYPE "GrowthMapStatus" ADD VALUE 'COMPLETED';

-- AlterTable
ALTER TABLE "career_plans" ADD COLUMN     "employeeComments" JSONB;
