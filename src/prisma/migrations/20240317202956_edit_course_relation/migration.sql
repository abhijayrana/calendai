/*
  Warnings:

  - A unique constraint covering the columns `[userId,assignmentId]` on the table `Edit` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `courseId` to the `Edit` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Edit" ADD COLUMN     "courseId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Edit_userId_assignmentId_key" ON "Edit"("userId", "assignmentId");

-- AddForeignKey
ALTER TABLE "Edit" ADD CONSTRAINT "Edit_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
