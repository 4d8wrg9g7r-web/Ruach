-- CreateEnum
CREATE TYPE "WidgetDisplayStyle" AS ENUM ('BUBBLE', 'SLIDE', 'INLINE', 'DOCK', 'PALETTE', 'GREETER', 'SHEET', 'TAB', 'RIBBON', 'LINK');

-- AlterTable
ALTER TABLE "WidgetConfiguration" ADD COLUMN     "displayStyle" "WidgetDisplayStyle" NOT NULL DEFAULT 'BUBBLE';
