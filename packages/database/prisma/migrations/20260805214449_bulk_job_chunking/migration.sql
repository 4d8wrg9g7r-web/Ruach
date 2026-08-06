-- AlterTable
ALTER TABLE "BulkJob" ADD COLUMN     "extraCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "processedResourceIds" TEXT[] DEFAULT ARRAY[]::TEXT[];
