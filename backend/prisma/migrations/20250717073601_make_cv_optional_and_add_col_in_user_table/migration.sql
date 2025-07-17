-- AlterTable
ALTER TABLE "internship_applications" ALTER COLUMN "cv_path" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "activityEnd" TIMESTAMP(3),
ADD COLUMN     "activityStart" TIMESTAMP(3),
ADD COLUMN     "activityType" TEXT,
ADD COLUMN     "educationStatus" TEXT;
