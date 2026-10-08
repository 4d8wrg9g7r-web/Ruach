-- AlterTable
ALTER TABLE "WidgetConfiguration" ALTER COLUMN "noResultMessage" SET DEFAULT 'I''m sorry, I''m not sure of the answer to your question. I was built to match you with sermon content.';

-- Move widgets still on the old default to the new copy. Widgets whose staff
-- customized this message are left alone.
UPDATE "WidgetConfiguration"
SET "noResultMessage" = 'I''m sorry, I''m not sure of the answer to your question. I was built to match you with sermon content.'
WHERE "noResultMessage" = 'I couldn''t find a resource that directly addresses that yet.';
