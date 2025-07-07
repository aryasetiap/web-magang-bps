-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "final_projects" ALTER COLUMN "status" SET DEFAULT 'belum_submit';

-- AlterTable
ALTER TABLE "internship_applications" ALTER COLUMN "status" SET DEFAULT 'pending';

-- AlterTable
ALTER TABLE "logbooks" ALTER COLUMN "status" SET DEFAULT 'draft';
