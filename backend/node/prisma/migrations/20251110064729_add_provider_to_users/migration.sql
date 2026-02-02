-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "provider" TEXT NOT NULL DEFAULT 'local';
-- Update existing OAuth users (they have empty passwords)
UPDATE "User"
SET "provider" = 'google', "password" = NULL
WHERE "password" = '';
