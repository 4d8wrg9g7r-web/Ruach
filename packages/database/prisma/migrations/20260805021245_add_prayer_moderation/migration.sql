-- CreateEnum
CREATE TYPE "PrayerRequestCategory" AS ENUM ('HEALTH', 'FAMILY', 'FINANCIAL', 'SPIRITUAL_GROWTH', 'GRIEF_LOSS', 'GUIDANCE', 'OTHER');

-- AlterEnum
ALTER TYPE "OrganizationRole" ADD VALUE 'PRAYER_MODERATOR';

-- AlterTable: add the new array column first, backfill from the old scalar column,
-- then drop it -- preserves any existing forwarding-email data instead of losing it.
ALTER TABLE "Organization" ADD COLUMN     "prayerRequestForwardingEmails" TEXT[] DEFAULT ARRAY[]::TEXT[];

UPDATE "Organization"
SET "prayerRequestForwardingEmails" = ARRAY["prayerRequestForwardingEmail"]
WHERE "prayerRequestForwardingEmail" IS NOT NULL;

ALTER TABLE "Organization" DROP COLUMN "prayerRequestForwardingEmail";

-- AlterTable
ALTER TABLE "PrayerRequest" ADD COLUMN     "category" "PrayerRequestCategory",
ADD COLUMN     "internalNotes" TEXT;
