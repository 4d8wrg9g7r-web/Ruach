-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "prayerWallBrandColor" TEXT,
ADD COLUMN     "prayerWallLogoUrl" TEXT;

-- AlterTable
ALTER TABLE "PrayerRequest" ADD COLUMN     "publicizedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "WidgetConfiguration" ADD COLUMN     "logoUrl" TEXT;
