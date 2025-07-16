-- AlterTable
ALTER TABLE "submissions" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "deletedAt" TIMESTAMP(3);
