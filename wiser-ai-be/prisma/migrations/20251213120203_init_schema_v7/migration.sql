-- CreateEnum
CREATE TYPE "UserLevel" AS ENUM ('FRESHER', 'JUNIOR', 'SENIOR', 'PRINCIPAL');

-- AlterTable
ALTER TABLE "career_plans" ADD COLUMN     "targetLevel" "UserLevel";

-- DropEnum
DROP TYPE "Level";
