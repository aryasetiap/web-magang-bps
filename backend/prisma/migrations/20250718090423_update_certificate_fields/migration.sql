/*
  Warnings:

  - You are about to drop the column `signed_at` on the `certificates` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `certificates` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "certificates" DROP COLUMN "signed_at",
DROP COLUMN "status",
ADD COLUMN     "adminNote" TEXT,
ADD COLUMN     "certificateStatus" "StatusCertificate" NOT NULL DEFAULT 'generated',
ADD COLUMN     "signed_date" TIMESTAMP(3);
