-- CreateEnum
CREATE TYPE "CertificateStatus" AS ENUM ('generated', 'signed', 'issued');

-- CreateTable
CREATE TABLE "certificates" (
    "id" SERIAL NOT NULL,
    "certificateNumber" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "internName" TEXT NOT NULL,
    "educationalStatus" TEXT NOT NULL,
    "institusi" TEXT NOT NULL,
    "predicate" TEXT NOT NULL,
    "namaKegiatan" TEXT NOT NULL,
    "activityPeriod" TEXT NOT NULL,
    "tglSertifikat" TIMESTAMP(3) NOT NULL,
    "namaKepalaBPS" TEXT NOT NULL,
    "nipKepalaBPS" TEXT NOT NULL,
    "templatePath" TEXT NOT NULL,
    "signedFilePath" TEXT,
    "status" "CertificateStatus" NOT NULL DEFAULT 'generated',
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "signedAt" TIMESTAMP(3),
    "issuedAt" TIMESTAMP(3),
    "createdBy" INTEGER NOT NULL,
    "updatedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "certificates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "certificates_certificateNumber_key" ON "certificates"("certificateNumber");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_userId_key" ON "certificates"("userId");

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
