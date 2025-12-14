/*
  Warnings:

  - You are about to drop the column `userEmail` on the `employee_profile_mapping` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `employee_profile_mapping` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `employee_profile_mapping` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "employee_profile_mapping" DROP COLUMN "userEmail",
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "jobTitle" TEXT,
ADD COLUMN     "level" TEXT,
ALTER COLUMN "name" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "employee_profile_mapping_userId_key" ON "employee_profile_mapping"("userId");

-- AddForeignKey
ALTER TABLE "employee_profile_mapping" ADD CONSTRAINT "employee_profile_mapping_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
