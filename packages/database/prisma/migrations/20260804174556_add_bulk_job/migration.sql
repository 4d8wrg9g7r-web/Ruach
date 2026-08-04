-- CreateEnum
CREATE TYPE "BulkJobType" AS ENUM ('ANALYZE', 'APPROVE', 'REJECT', 'DELETE', 'FIND_LINKS', 'INCLUDE_LINKS');

-- CreateEnum
CREATE TYPE "BulkJobStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "BulkJob" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "type" "BulkJobType" NOT NULL,
    "status" "BulkJobStatus" NOT NULL DEFAULT 'PENDING',
    "resourceIds" TEXT[],
    "totalCount" INTEGER NOT NULL,
    "processedCount" INTEGER NOT NULL DEFAULT 0,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "failureCount" INTEGER NOT NULL DEFAULT 0,
    "resultSummary" TEXT,
    "errorMessage" TEXT,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BulkJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BulkJob_organizationId_idx" ON "BulkJob"("organizationId");

-- CreateIndex
CREATE INDEX "BulkJob_organizationId_status_idx" ON "BulkJob"("organizationId", "status");

-- AddForeignKey
ALTER TABLE "BulkJob" ADD CONSTRAINT "BulkJob_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
