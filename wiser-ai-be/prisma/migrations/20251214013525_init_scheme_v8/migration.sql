/*
  Warnings:

  - Changed the type of `position` on the `role_skill_mapping` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "employee_profile_mapping" DROP CONSTRAINT "employee_profile_mapping_userId_fkey";

-- AlterTable
ALTER TABLE "role_skill_mapping" DROP COLUMN "position",
ADD COLUMN     "position" "Position" NOT NULL;

-- AddForeignKey
ALTER TABLE "employee_profile_mapping" ADD CONSTRAINT "employee_profile_mapping_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
