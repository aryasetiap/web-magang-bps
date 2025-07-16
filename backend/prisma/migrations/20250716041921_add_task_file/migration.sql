-- AlterTable
ALTER TABLE "submissions" ADD COLUMN     "isLate" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "file_path" TEXT;
