-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "testimoniesEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "testimoniesPageName" TEXT NOT NULL DEFAULT 'Praise Report';

-- AlterTable
ALTER TABLE "Website" ADD COLUMN     "testimoniesEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "testimoniesPageName" TEXT NOT NULL DEFAULT 'Praise Report';

-- CreateTable
CREATE TABLE "Testimony" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "websiteId" TEXT,
    "accountId" TEXT,
    "message" TEXT NOT NULL,
    "authorDisplayName" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "youtubeUrl" TEXT,
    "youtubeVideoId" TEXT,
    "youtubeEmbedUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Testimony_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Testimony_organizationId_idx" ON "Testimony"("organizationId");

-- CreateIndex
CREATE INDEX "Testimony_accountId_idx" ON "Testimony"("accountId");

-- CreateIndex
CREATE INDEX "Testimony_websiteId_idx" ON "Testimony"("websiteId");

-- AddForeignKey
ALTER TABLE "Testimony" ADD CONSTRAINT "Testimony_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Testimony" ADD CONSTRAINT "Testimony_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Testimony" ADD CONSTRAINT "Testimony_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "PrayerWallAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Testimony" ADD CONSTRAINT "Testimony_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
