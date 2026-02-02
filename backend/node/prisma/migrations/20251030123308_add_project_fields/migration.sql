-- AlterTable
ALTER TABLE "public"."Project" ADD COLUMN     "contact" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'Active';
