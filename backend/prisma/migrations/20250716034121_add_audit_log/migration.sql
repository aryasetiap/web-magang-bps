/*
  Warnings:

  - The values [revision] on the enum `StatusFinalProject` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "StatusFinalProject_new" AS ENUM ('draft', 'submitted', 'reviewed', 'accepted', 'revisi');
ALTER TABLE "final_projects" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "final_projects" ALTER COLUMN "status" TYPE "StatusFinalProject_new" USING ("status"::text::"StatusFinalProject_new");
ALTER TYPE "StatusFinalProject" RENAME TO "StatusFinalProject_old";
ALTER TYPE "StatusFinalProject_new" RENAME TO "StatusFinalProject";
DROP TYPE "StatusFinalProject_old";
ALTER TABLE "final_projects" ALTER COLUMN "status" SET DEFAULT 'draft';
COMMIT;

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);
