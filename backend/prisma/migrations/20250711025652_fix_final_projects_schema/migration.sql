/*
  Warnings:

  - You are about to drop the column `reviewer_id` on the `final_projects` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "final_projects" DROP CONSTRAINT "final_projects_reviewer_id_fkey";

-- AlterTable
ALTER TABLE "final_projects" DROP COLUMN "reviewer_id",
ADD COLUMN     "reviewed_by_id" INTEGER;

-- AddForeignKey
ALTER TABLE "final_projects" ADD CONSTRAINT "final_projects_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
