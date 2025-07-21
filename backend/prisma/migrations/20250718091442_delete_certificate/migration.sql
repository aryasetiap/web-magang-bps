/*
  Warnings:

  - You are about to drop the `certificates` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "certificates" DROP CONSTRAINT "certificates_generated_by_id_fkey";

-- DropForeignKey
ALTER TABLE "certificates" DROP CONSTRAINT "certificates_user_id_fkey";

-- DropTable
DROP TABLE "certificates";

-- DropEnum
DROP TYPE "StatusCertificate";
