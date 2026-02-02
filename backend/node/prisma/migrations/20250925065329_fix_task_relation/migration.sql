/*
  Warnings:

  - A unique constraint covering the columns `[projectId,title]` on the table `Task` will be added. If there are existing duplicate values, this will fail.
  - Made the column `projectId` on table `Task` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."Task" DROP CONSTRAINT "Task_projectId_fkey";

-- DropIndex
DROP INDEX "public"."Task_title_key";

-- AlterTable
ALTER TABLE "public"."Task" ALTER COLUMN "projectId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Task_projectId_idx" ON "public"."Task"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Task_projectId_title_key" ON "public"."Task"("projectId", "title");

-- AddForeignKey
ALTER TABLE "public"."Task" ADD CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
