/*
  Warnings:

  - The `careerGoal` column on the `career_plans` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `currentCompetencies` column on the `career_plans` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "career_plans" ADD COLUMN     "suggestedCourses" JSONB,
DROP COLUMN "careerGoal",
ADD COLUMN     "careerGoal" JSONB,
DROP COLUMN "currentCompetencies",
ADD COLUMN     "currentCompetencies" JSONB;
