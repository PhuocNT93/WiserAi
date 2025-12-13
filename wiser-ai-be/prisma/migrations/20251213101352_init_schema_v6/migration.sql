/*
  Warnings:

  - You are about to drop the column `userId` on the `employee_profile_mapping` table. All the data in the column will be lost.
  - Added the required column `userEmail` to the `employee_profile_mapping` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "employee_profile_mapping" DROP COLUMN "userId",
ADD COLUMN     "userEmail" TEXT NOT NULL;
