-- AlterTable
ALTER TABLE "submissions" ADD COLUMN     "gradedAt" TIMESTAMP(3),
ADD COLUMN     "gradedBy" INTEGER;
