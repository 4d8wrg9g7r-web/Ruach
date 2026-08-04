-- AlterTable
ALTER TABLE "ActionLink" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- Backfill: give existing rows per-org distinct order values (by creation order)
-- instead of leaving every row at the column default of 0.
UPDATE "ActionLink"
SET "order" = sub.rn - 1
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY "organizationId" ORDER BY "createdAt") AS rn
  FROM "ActionLink"
) sub
WHERE "ActionLink".id = sub.id;
