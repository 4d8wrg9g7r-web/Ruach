-- AlterTable
ALTER TABLE "Resource" ADD COLUMN     "messageTypes" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "WidgetConfiguration" ADD COLUMN     "libraryResourceTypes" "ResourceType"[] DEFAULT ARRAY['SERMON', 'VIDEO', 'AUDIO', 'PODCAST', 'DEVOTIONAL']::"ResourceType"[];
