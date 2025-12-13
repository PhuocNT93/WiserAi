-- CreateEnum
CREATE TYPE "ReviewPeriod" AS ENUM ('SIX_MONTHS', 'TWELVE_MONTHS');

-- CreateEnum
CREATE TYPE "GrowthMapStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'BACK_TO_SUBMIT', 'SUCCESS');

-- CreateTable
CREATE TABLE "career_plans" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "managerId" INTEGER,
    "year" INTEGER NOT NULL,
    "reviewPeriod" "ReviewPeriod" NOT NULL,
    "status" "GrowthMapStatus" NOT NULL DEFAULT 'DRAFT',
    "objectives" TEXT NOT NULL,
    "achievements" TEXT NOT NULL,
    "certificates" JSONB,
    "improvements" TEXT NOT NULL,
    "expectations" TEXT NOT NULL,
    "careerGoal" TEXT,
    "currentCompetencies" TEXT,
    "focusAreas" JSONB,
    "actionPlan" JSONB,
    "supportNeeded" JSONB,
    "managerComments" JSONB,
    "submittedAt" TIMESTAMP(3),
    "confirmedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "career_plans_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "career_plans" ADD CONSTRAINT "career_plans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_plans" ADD CONSTRAINT "career_plans_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
