-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('hadir', 'sakit', 'izin', 'tanpa_keterangan');

-- AlterTable
ALTER TABLE "attendances" ADD COLUMN     "proofFilePath" TEXT,
ADD COLUMN     "reasonDescription" TEXT,
ADD COLUMN     "status" "AttendanceStatus" NOT NULL DEFAULT 'hadir',
ADD COLUMN     "submittedAt" TIMESTAMP(3),
ADD COLUMN     "validatedAt" TIMESTAMP(3),
ADD COLUMN     "validatedBy" INTEGER,
ALTER COLUMN "clock_in" DROP NOT NULL,
ALTER COLUMN "ip_address" DROP NOT NULL;
