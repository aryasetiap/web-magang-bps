-- AlterTable
ALTER TABLE "users" ADD COLUMN     "resetPasswordOtp" TEXT,
ADD COLUMN     "resetPasswordOtpExpires" TIMESTAMP(3);
