/*
  Warnings:

  - You are about to drop the column `adminNote` on the `certificates` table. All the data in the column will be lost.
  - You are about to drop the column `certificateStatus` on the `certificates` table. All the data in the column will be lost.
  - You are about to drop the column `signed_date` on the `certificates` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "certificates" DROP COLUMN "adminNote",
DROP COLUMN "certificateStatus",
DROP COLUMN "signed_date",
ADD COLUMN     "signed_at" TIMESTAMP(3),
ADD COLUMN     "status" "StatusCertificate" NOT NULL DEFAULT 'generated';
