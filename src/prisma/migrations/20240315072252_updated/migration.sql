-- AlterTable
ALTER TABLE "Assignment" ADD COLUMN     "estimatedTime" INTEGER;

-- AlterTable
ALTER TABLE "Edit" ADD COLUMN     "estimatedTime" INTEGER,
ADD COLUMN     "pointsPossible" DOUBLE PRECISION;
