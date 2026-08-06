-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "usageWarning75SentAt" TIMESTAMP(3),
ADD COLUMN     "usageWarning90SentAt" TIMESTAMP(3),
ALTER COLUMN "planKey" SET DEFAULT 'essential';

-- Data backfill: rename existing planKey values to match the new tier naming
-- (starter -> essential, pro -> multisite). Safe to run repeatedly (idempotent).
UPDATE "Organization" SET "planKey" = 'essential' WHERE "planKey" = 'starter';
UPDATE "Organization" SET "planKey" = 'multisite' WHERE "planKey" = 'pro';
