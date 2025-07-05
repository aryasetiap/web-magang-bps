/*
  Warnings:

  - You are about to drop the column `proposal_path` on the `internship_applications` table. All the data in the column will be lost.
  - Added the required column `request_letter_path` to the `internship_applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transcript_path` to the `internship_applications` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "internship_applications" DROP COLUMN "proposal_path",
ADD COLUMN     "request_letter_path" TEXT NOT NULL,
ADD COLUMN     "transcript_path" TEXT NOT NULL;
