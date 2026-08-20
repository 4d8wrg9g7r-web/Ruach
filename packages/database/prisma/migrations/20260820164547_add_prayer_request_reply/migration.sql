-- CreateTable
CREATE TABLE "PrayerRequestReply" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "staffUserId" TEXT,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrayerRequestReply_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PrayerRequestReply_organizationId_idx" ON "PrayerRequestReply"("organizationId");

-- CreateIndex
CREATE INDEX "PrayerRequestReply_requestId_idx" ON "PrayerRequestReply"("requestId");

-- AddForeignKey
ALTER TABLE "PrayerRequestReply" ADD CONSTRAINT "PrayerRequestReply_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrayerRequestReply" ADD CONSTRAINT "PrayerRequestReply_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "PrayerRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrayerRequestReply" ADD CONSTRAINT "PrayerRequestReply_staffUserId_fkey" FOREIGN KEY ("staffUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
