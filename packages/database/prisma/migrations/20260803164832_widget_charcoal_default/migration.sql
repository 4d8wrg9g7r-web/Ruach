-- AlterTable
ALTER TABLE "WidgetConfiguration" ALTER COLUMN "primaryColor" SET DEFAULT '#161616';

-- Backfill: widgets created under the old default that were never customized by the
-- subscriber should pick up the new default too.
UPDATE "WidgetConfiguration" SET "primaryColor" = '#161616' WHERE "primaryColor" = '#2563EB';
