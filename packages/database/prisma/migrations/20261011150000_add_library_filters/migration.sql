-- AlterTable
ALTER TABLE "WidgetConfiguration" ADD COLUMN     "libraryFilters" TEXT[] DEFAULT ARRAY['speaker', 'topic', 'scripture', 'messageType', 'format', 'series']::TEXT[];
