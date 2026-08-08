-- Add Organization.publicSiteId (public URL key for /c/<id> calendar and /g/<id> group
-- finder). Backfill existing rows with a generated value, then enforce NOT NULL +
-- unique. New rows get client-side cuid() defaults from Prisma, so no DB default kept.
ALTER TABLE "Organization" ADD COLUMN "publicSiteId" TEXT;
UPDATE "Organization" SET "publicSiteId" = gen_random_uuid()::text WHERE "publicSiteId" IS NULL;
ALTER TABLE "Organization" ALTER COLUMN "publicSiteId" SET NOT NULL;
CREATE UNIQUE INDEX "Organization_publicSiteId_key" ON "Organization"("publicSiteId");
