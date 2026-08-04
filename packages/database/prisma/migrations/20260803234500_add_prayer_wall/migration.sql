-- CreateEnum
CREATE TYPE "PrayerRequestStatus" AS ENUM ('SUBMITTED', 'ANSWERED');

-- AlterTable
-- publicPrayerWallId is added nullable first (unlike a normal required column, it has
-- no single DB-level default that could produce distinct values per existing row --
-- Prisma's cuid() default is client-side only) so existing Organization rows can be
-- backfilled with distinct values before the NOT NULL + UNIQUE constraints are added.
ALTER TABLE "Organization" ADD COLUMN     "prayerRequestForwardingEmail" TEXT,
ADD COLUMN     "prayerWallEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "publicPrayerWallId" TEXT;

-- Backfill: one distinct opaque value per existing row. Doesn't need to be a real
-- cuid, just unique and unguessable -- every future row gets a real cuid() from
-- Prisma's client-side default.
UPDATE "Organization" SET "publicPrayerWallId" = md5(random()::text || clock_timestamp()::text || id);

ALTER TABLE "Organization" ALTER COLUMN "publicPrayerWallId" SET NOT NULL;

-- CreateTable
CREATE TABLE "PrayerWallAccount" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrayerWallAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrayerWallSession" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrayerWallSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrayerRequest" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "status" "PrayerRequestStatus" NOT NULL DEFAULT 'SUBMITTED',
    "prayerCount" INTEGER NOT NULL DEFAULT 0,
    "answeredAt" TIMESTAMP(3),
    "forwardedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrayerRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PrayerWallAccount_organizationId_idx" ON "PrayerWallAccount"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "PrayerWallAccount_organizationId_email_key" ON "PrayerWallAccount"("organizationId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "PrayerWallSession_token_key" ON "PrayerWallSession"("token");

-- CreateIndex
CREATE INDEX "PrayerWallSession_accountId_idx" ON "PrayerWallSession"("accountId");

-- CreateIndex
CREATE INDEX "PrayerRequest_organizationId_idx" ON "PrayerRequest"("organizationId");

-- CreateIndex
CREATE INDEX "PrayerRequest_accountId_idx" ON "PrayerRequest"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_publicPrayerWallId_key" ON "Organization"("publicPrayerWallId");

-- AddForeignKey
ALTER TABLE "PrayerWallAccount" ADD CONSTRAINT "PrayerWallAccount_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrayerWallSession" ADD CONSTRAINT "PrayerWallSession_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "PrayerWallAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrayerRequest" ADD CONSTRAINT "PrayerRequest_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrayerRequest" ADD CONSTRAINT "PrayerRequest_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "PrayerWallAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
