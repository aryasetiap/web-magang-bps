/*
  Warnings:

  - You are about to drop the column `submitted_at` on the `submissions` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "StatusSubmission" AS ENUM ('not_submitted', 'submitted', 'reviewed', 'revisi');

-- AlterTable
ALTER TABLE "submissions" DROP COLUMN "submitted_at",
ADD COLUMN     "status" "StatusSubmission" NOT NULL DEFAULT 'not_submitted',
ALTER COLUMN "file_path" DROP NOT NULL,
ALTER COLUMN "grade" SET DATA TYPE DOUBLE PRECISION;
