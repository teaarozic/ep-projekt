-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "name" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'Active';
