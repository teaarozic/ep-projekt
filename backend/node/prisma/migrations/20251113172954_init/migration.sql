-- CreateEnum
CREATE TYPE "public"."AiType" AS ENUM ('SUMMARIZE', 'SENTIMENT', 'CSV');

-- CreateEnum
CREATE TYPE "public"."AiStatus" AS ENUM ('PENDING', 'SUCCESS', 'ERROR');

-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "password" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."AiResult" (
    "id" SERIAL NOT NULL,
    "type" "public"."AiType" NOT NULL,
    "preview" VARCHAR(200) NOT NULL,
    "status" "public"."AiStatus" NOT NULL DEFAULT 'SUCCESS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AiResult_createdAt_type_status_idx" ON "public"."AiResult"("createdAt", "type", "status");
