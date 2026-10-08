-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "questionForwardingEmails" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Website" ADD COLUMN     "questionForwardingEmails" TEXT[] DEFAULT ARRAY[]::TEXT[];
