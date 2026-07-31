-- CreateEnum
CREATE TYPE "OrganizationRole" AS ENUM ('OWNER', 'ADMIN', 'CONTENT_MANAGER', 'ANALYTICS_VIEWER');

-- CreateEnum
CREATE TYPE "CategorizationMode" AS ENUM ('MANUAL', 'ASSISTED', 'AUTOMATIC');

-- CreateEnum
CREATE TYPE "WebsiteStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "WidgetStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "LauncherPosition" AS ENUM ('BOTTOM_RIGHT', 'BOTTOM_LEFT');

-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('VIDEO', 'SERMON', 'PODCAST', 'ARTICLE', 'COURSE', 'DOCUMENT', 'DEVOTIONAL', 'AUDIO', 'OTHER');

-- CreateEnum
CREATE TYPE "ResourceStatus" AS ENUM ('DRAFT', 'PROCESSING', 'REVIEW_REQUIRED', 'APPROVED', 'ACTIVE', 'INACTIVE', 'FAILED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ResourceProviderType" AS ENUM ('YOUTUBE', 'VIMEO', 'SUBSPLASH', 'GENERIC_URL', 'MANUAL');

-- CreateEnum
CREATE TYPE "TranscriptSource" AS ENUM ('PROVIDER_CAPTIONS', 'UPLOADED_CAPTIONS', 'MANUAL_TRANSCRIPT', 'LINKED_NOTES', 'AUTOMATIC_TRANSCRIPTION', 'METADATA_ONLY');

-- CreateEnum
CREATE TYPE "SourceDocumentType" AS ENUM ('VIDEO_DESCRIPTION', 'PROVIDER_METADATA', 'TRANSCRIPT', 'CAPTION_FILE', 'SERMON_NOTES', 'PDF', 'WEB_PAGE', 'MANUAL_NOTES', 'OTHER');

-- CreateEnum
CREATE TYPE "ImportType" AS ENUM ('SINGLE', 'PLAYLIST', 'CHANNEL', 'MANUAL');

-- CreateEnum
CREATE TYPE "ImportJobStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'PARTIAL');

-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('USER', 'ASSISTANT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "categorizationMode" "CategorizationMode" NOT NULL DEFAULT 'ASSISTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationMember" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "OrganizationRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrganizationMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Website" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "primaryDomain" TEXT NOT NULL,
    "allowedDomains" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "stagingDomains" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "WebsiteStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Website_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WidgetConfiguration" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "websiteId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "publicWidgetId" TEXT NOT NULL,
    "status" "WidgetStatus" NOT NULL DEFAULT 'ACTIVE',
    "assistantName" TEXT NOT NULL DEFAULT 'Resource Assistant',
    "welcomeMessage" TEXT NOT NULL DEFAULT 'Hi! What are you looking for today?',
    "inputPlaceholder" TEXT NOT NULL DEFAULT 'Ask a question...',
    "launcherLabel" TEXT NOT NULL DEFAULT 'Ask a question',
    "launcherPosition" "LauncherPosition" NOT NULL DEFAULT 'BOTTOM_RIGHT',
    "primaryColor" TEXT NOT NULL DEFAULT '#2563EB',
    "suggestedPrompts" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "privacyNotice" TEXT NOT NULL DEFAULT 'Conversations are anonymous and not linked to your identity.',
    "noResultMessage" TEXT NOT NULL DEFAULT 'I couldn''t find a resource that directly addresses that yet.',
    "maxRecommendations" INTEGER NOT NULL DEFAULT 3,
    "allowInlinePlayback" BOOLEAN NOT NULL DEFAULT true,
    "showPlatformBranding" BOOLEAN NOT NULL DEFAULT true,
    "conversationRetentionDays" INTEGER NOT NULL DEFAULT 30,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WidgetConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resource" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "resourceType" "ResourceType" NOT NULL,
    "status" "ResourceStatus" NOT NULL DEFAULT 'DRAFT',
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "summary" TEXT,
    "creatorName" TEXT,
    "speakerName" TEXT,
    "seriesTitle" TEXT,
    "publishedAt" TIMESTAMP(3),
    "durationSeconds" INTEGER,
    "thumbnailUrl" TEXT,
    "publicUrl" TEXT NOT NULL,
    "embedUrl" TEXT,
    "sourceProvider" "ResourceProviderType" NOT NULL,
    "externalId" TEXT NOT NULL,
    "transcript" TEXT,
    "cleanTranscript" TEXT,
    "transcriptSource" "TranscriptSource",
    "topics" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "primaryTopic" TEXT,
    "secondaryTopics" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "scriptures" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "questionsAnswered" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "audiences" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "lifeSituations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "keyTakeaways" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "searchDocument" TEXT,
    "contentHash" TEXT,
    "lastIndexedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResourceSourceDocument" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "sourceType" "SourceDocumentType" NOT NULL,
    "sourceUrl" TEXT,
    "fileName" TEXT,
    "originalText" TEXT,
    "cleanText" TEXT,
    "includedInAnalysis" BOOLEAN NOT NULL DEFAULT true,
    "approvedByUser" BOOLEAN NOT NULL DEFAULT false,
    "discoveredAutomatically" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResourceSourceDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneratedMetadataEvidence" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "generatedValue" TEXT NOT NULL,
    "sourceDocumentId" TEXT,
    "sourceExcerpt" TEXT,
    "confidenceScore" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GeneratedMetadataEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Collection" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Collection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResourceCollection" (
    "organizationId" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResourceCollection_pkey" PRIMARY KEY ("resourceId","collectionId")
);

-- CreateTable
CREATE TABLE "ImportJob" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "provider" "ResourceProviderType" NOT NULL,
    "importType" "ImportType" NOT NULL,
    "status" "ImportJobStatus" NOT NULL DEFAULT 'PENDING',
    "totalItems" INTEGER NOT NULL DEFAULT 0,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "failureCount" INTEGER NOT NULL DEFAULT 0,
    "errorLog" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImportJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportJobItem" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "importJobId" TEXT NOT NULL,
    "resourceId" TEXT,
    "sourceUrl" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL DEFAULT false,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImportJobItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "widgetId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationMessage" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" "MessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "responseType" TEXT,
    "recommendedResourceIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConversationMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActionLink" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "icon" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActionLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "actorUserId" TEXT,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE INDEX "OrganizationMember_organizationId_idx" ON "OrganizationMember"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationMember_organizationId_userId_key" ON "OrganizationMember"("organizationId", "userId");

-- CreateIndex
CREATE INDEX "Website_organizationId_idx" ON "Website"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "WidgetConfiguration_publicWidgetId_key" ON "WidgetConfiguration"("publicWidgetId");

-- CreateIndex
CREATE INDEX "WidgetConfiguration_organizationId_idx" ON "WidgetConfiguration"("organizationId");

-- CreateIndex
CREATE INDEX "WidgetConfiguration_websiteId_idx" ON "WidgetConfiguration"("websiteId");

-- CreateIndex
CREATE INDEX "Resource_organizationId_status_idx" ON "Resource"("organizationId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Resource_organizationId_sourceProvider_externalId_key" ON "Resource"("organizationId", "sourceProvider", "externalId");

-- CreateIndex
CREATE INDEX "ResourceSourceDocument_organizationId_idx" ON "ResourceSourceDocument"("organizationId");

-- CreateIndex
CREATE INDEX "ResourceSourceDocument_resourceId_idx" ON "ResourceSourceDocument"("resourceId");

-- CreateIndex
CREATE INDEX "GeneratedMetadataEvidence_organizationId_idx" ON "GeneratedMetadataEvidence"("organizationId");

-- CreateIndex
CREATE INDEX "GeneratedMetadataEvidence_resourceId_idx" ON "GeneratedMetadataEvidence"("resourceId");

-- CreateIndex
CREATE INDEX "Collection_organizationId_idx" ON "Collection"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Collection_organizationId_slug_key" ON "Collection"("organizationId", "slug");

-- CreateIndex
CREATE INDEX "ResourceCollection_organizationId_idx" ON "ResourceCollection"("organizationId");

-- CreateIndex
CREATE INDEX "ImportJob_organizationId_idx" ON "ImportJob"("organizationId");

-- CreateIndex
CREATE INDEX "ImportJobItem_organizationId_idx" ON "ImportJobItem"("organizationId");

-- CreateIndex
CREATE INDEX "ImportJobItem_importJobId_idx" ON "ImportJobItem"("importJobId");

-- CreateIndex
CREATE INDEX "Conversation_organizationId_idx" ON "Conversation"("organizationId");

-- CreateIndex
CREATE INDEX "Conversation_widgetId_sessionId_idx" ON "Conversation"("widgetId", "sessionId");

-- CreateIndex
CREATE INDEX "ConversationMessage_organizationId_idx" ON "ConversationMessage"("organizationId");

-- CreateIndex
CREATE INDEX "ConversationMessage_conversationId_idx" ON "ConversationMessage"("conversationId");

-- CreateIndex
CREATE INDEX "ActionLink_organizationId_idx" ON "ActionLink"("organizationId");

-- CreateIndex
CREATE INDEX "AuditLog_organizationId_idx" ON "AuditLog"("organizationId");

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Website" ADD CONSTRAINT "Website_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WidgetConfiguration" ADD CONSTRAINT "WidgetConfiguration_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WidgetConfiguration" ADD CONSTRAINT "WidgetConfiguration_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceSourceDocument" ADD CONSTRAINT "ResourceSourceDocument_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceSourceDocument" ADD CONSTRAINT "ResourceSourceDocument_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedMetadataEvidence" ADD CONSTRAINT "GeneratedMetadataEvidence_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedMetadataEvidence" ADD CONSTRAINT "GeneratedMetadataEvidence_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedMetadataEvidence" ADD CONSTRAINT "GeneratedMetadataEvidence_sourceDocumentId_fkey" FOREIGN KEY ("sourceDocumentId") REFERENCES "ResourceSourceDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceCollection" ADD CONSTRAINT "ResourceCollection_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceCollection" ADD CONSTRAINT "ResourceCollection_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceCollection" ADD CONSTRAINT "ResourceCollection_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportJob" ADD CONSTRAINT "ImportJob_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportJobItem" ADD CONSTRAINT "ImportJobItem_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportJobItem" ADD CONSTRAINT "ImportJobItem_importJobId_fkey" FOREIGN KEY ("importJobId") REFERENCES "ImportJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportJobItem" ADD CONSTRAINT "ImportJobItem_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_widgetId_fkey" FOREIGN KEY ("widgetId") REFERENCES "WidgetConfiguration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationMessage" ADD CONSTRAINT "ConversationMessage_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationMessage" ADD CONSTRAINT "ConversationMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActionLink" ADD CONSTRAINT "ActionLink_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Full-text search index backing LocalRetrievalProvider (packages/retrieval).
-- Computed over title + searchDocument at query time; see that file's comments
-- for why this is an expression index rather than a denormalized tsvector column.
CREATE INDEX "Resource_search_fts_idx" ON "Resource"
  USING GIN (to_tsvector('english', coalesce("searchDocument", '') || ' ' || "title"));
