/*
  Warnings:

  - You are about to drop the column `completed` on the `Assignment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Assignment" DROP COLUMN "completed",
ADD COLUMN     "grade" TEXT,
ADD COLUMN     "isMissing" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "score" DOUBLE PRECISION,
ADD COLUMN     "status" TEXT DEFAULT 'unsubmitted';
