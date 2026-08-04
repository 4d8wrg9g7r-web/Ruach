-- CreateTable
CREATE TABLE "ContentSource" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "provider" "ResourceProviderType" NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "label" TEXT,
    "autoSyncEnabled" BOOLEAN NOT NULL DEFAULT true,
    "autoApprove" BOOLEAN NOT NULL DEFAULT false,
    "lastSyncedAt" TIMESTAMP(3),
    "lastSyncStatus" "ImportJobStatus",
    "lastSyncError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentSource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContentSource_organizationId_idx" ON "ContentSource"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "ContentSource_organizationId_provider_sourceUrl_key" ON "ContentSource"("organizationId", "provider", "sourceUrl");

-- AddForeignKey
ALTER TABLE "ContentSource" ADD CONSTRAINT "ContentSource_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
