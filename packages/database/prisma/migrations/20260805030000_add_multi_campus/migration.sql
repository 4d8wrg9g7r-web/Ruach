-- AlterTable
ALTER TABLE "PrayerRequest" ADD COLUMN     "websiteId" TEXT;

-- AlterTable
ALTER TABLE "Resource" ADD COLUMN     "websiteId" TEXT;

-- AlterTable
ALTER TABLE "Website" ADD COLUMN     "prayerRequestForwardingEmails" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "prayerWallBrandColor" TEXT,
ADD COLUMN     "prayerWallEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "prayerWallLogoUrl" TEXT,
ADD COLUMN     "publicPrayerWallId" TEXT;

-- CreateIndex
CREATE INDEX "PrayerRequest_websiteId_idx" ON "PrayerRequest"("websiteId");

-- CreateIndex
CREATE INDEX "Resource_websiteId_idx" ON "Resource"("websiteId");

-- CreateIndex
CREATE UNIQUE INDEX "Website_publicPrayerWallId_key" ON "Website"("publicPrayerWallId");

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrayerRequest" ADD CONSTRAINT "PrayerRequest_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website"("id") ON DELETE SET NULL ON UPDATE CASCADE;

