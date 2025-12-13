/*
  Warnings:

  - You are about to drop the `master_data` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Position" AS ENUM ('DEV', 'QC', 'BA');

-- CreateEnum
CREATE TYPE "Level" AS ENUM ('Fresher', 'Junior', 'Senior', 'Master');

-- DropTable
DROP TABLE "master_data";

-- CreateTable
CREATE TABLE "role_skill_mapping" (
    "id" SERIAL NOT NULL,
    "position" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "role_skill_mapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_profile_mapping" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "engName" TEXT NOT NULL,
    "empCode" TEXT NOT NULL,
    "busUnit" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_profile_mapping_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "role_skill_mapping_code_key" ON "role_skill_mapping"("code");

-- CreateIndex
CREATE UNIQUE INDEX "employee_profile_mapping_empCode_key" ON "employee_profile_mapping"("empCode");

-- AddForeignKey
ALTER TABLE "employee_profile_mapping" ADD CONSTRAINT "employee_profile_mapping_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
