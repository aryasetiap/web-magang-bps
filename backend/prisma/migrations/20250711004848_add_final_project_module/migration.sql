/*
  Warnings:

  - The values [belum_submit,lulus,revisi] on the enum `StatusFinalProject` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `repo_link` on the `final_projects` table. All the data in the column will be lost.
  - Added the required column `title` to the `final_projects` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `final_projects` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "StatusFinalProject_new" AS ENUM ('draft', 'submitted', 'reviewed', 'accepted', 'revision');
ALTER TABLE "final_projects" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "final_projects" ALTER COLUMN "status" TYPE "StatusFinalProject_new" USING ("status"::text::"StatusFinalProject_new");
ALTER TYPE "StatusFinalProject" RENAME TO "StatusFinalProject_old";
ALTER TYPE "StatusFinalProject_new" RENAME TO "StatusFinalProject";
DROP TYPE "StatusFinalProject_old";
ALTER TABLE "final_projects" ALTER COLUMN "status" SET DEFAULT 'draft';
COMMIT;

-- DropIndex
DROP INDEX "final_projects_user_id_key";

-- AlterTable
ALTER TABLE "final_projects" DROP COLUMN "repo_link",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "feedback" TEXT,
ADD COLUMN     "grade" DOUBLE PRECISION,
ADD COLUMN     "reviewed_at" TIMESTAMP(3),
ADD COLUMN     "reviewer_id" INTEGER,
ADD COLUMN     "submitted_at" TIMESTAMP(3),
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "file_path" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'draft';

-- AddForeignKey
ALTER TABLE "final_projects" ADD CONSTRAINT "final_projects_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
