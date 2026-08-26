-- AlterEnum
ALTER TYPE "TranscriptSource" ADD VALUE 'EXTRACTED_PAGE_TEXT';

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "contactEmail" TEXT,
ADD COLUMN     "publicWebsiteUrl" TEXT;
