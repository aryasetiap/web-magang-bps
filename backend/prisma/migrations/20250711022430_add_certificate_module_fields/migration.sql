/*
  Warnings:

  - Added the required column `intern_name` to the `certificates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `certificates` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "StatusCertificate" AS ENUM ('generated', 'signed', 'issued');

-- AlterTable
ALTER TABLE "certificates" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "generated_by_id" INTEGER,
ADD COLUMN     "intern_name" TEXT NOT NULL,
ADD COLUMN     "issued_at" TIMESTAMP(3),
ADD COLUMN     "predicate" TEXT,
ADD COLUMN     "signed_at" TIMESTAMP(3),
ADD COLUMN     "signed_file_path" TEXT,
ADD COLUMN     "status" "StatusCertificate" NOT NULL DEFAULT 'generated',
ADD COLUMN     "template_path" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_generated_by_id_fkey" FOREIGN KEY ("generated_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
