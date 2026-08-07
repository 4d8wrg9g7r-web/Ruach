-- CreateEnum
CREATE TYPE "JourneyEnrollmentStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'EXITED');

-- CreateTable
CREATE TABLE "JourneyDefinition" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JourneyDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JourneyMilestone" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "targetDays" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JourneyMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JourneyEnrollment" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "status" "JourneyEnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "enrolledByUserId" TEXT,
    "workflowRunId" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "exitedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JourneyEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JourneyMilestoneCompletion" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "milestoneId" TEXT NOT NULL,
    "completedByUserId" TEXT,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JourneyMilestoneCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JourneyDefinition_organizationId_idx" ON "JourneyDefinition"("organizationId");

-- CreateIndex
CREATE INDEX "JourneyMilestone_organizationId_idx" ON "JourneyMilestone"("organizationId");

-- CreateIndex
CREATE INDEX "JourneyMilestone_journeyId_idx" ON "JourneyMilestone"("journeyId");

-- CreateIndex
CREATE UNIQUE INDEX "JourneyMilestone_journeyId_order_key" ON "JourneyMilestone"("journeyId", "order");

-- CreateIndex
CREATE INDEX "JourneyEnrollment_organizationId_idx" ON "JourneyEnrollment"("organizationId");

-- CreateIndex
CREATE INDEX "JourneyEnrollment_organizationId_status_idx" ON "JourneyEnrollment"("organizationId", "status");

-- CreateIndex
CREATE INDEX "JourneyEnrollment_personId_idx" ON "JourneyEnrollment"("personId");

-- CreateIndex
CREATE UNIQUE INDEX "JourneyEnrollment_journeyId_personId_key" ON "JourneyEnrollment"("journeyId", "personId");

-- CreateIndex
CREATE INDEX "JourneyMilestoneCompletion_organizationId_idx" ON "JourneyMilestoneCompletion"("organizationId");

-- CreateIndex
CREATE INDEX "JourneyMilestoneCompletion_enrollmentId_idx" ON "JourneyMilestoneCompletion"("enrollmentId");

-- CreateIndex
CREATE UNIQUE INDEX "JourneyMilestoneCompletion_enrollmentId_milestoneId_key" ON "JourneyMilestoneCompletion"("enrollmentId", "milestoneId");

-- AddForeignKey
ALTER TABLE "JourneyDefinition" ADD CONSTRAINT "JourneyDefinition_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JourneyMilestone" ADD CONSTRAINT "JourneyMilestone_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JourneyMilestone" ADD CONSTRAINT "JourneyMilestone_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "JourneyDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JourneyEnrollment" ADD CONSTRAINT "JourneyEnrollment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JourneyEnrollment" ADD CONSTRAINT "JourneyEnrollment_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "JourneyDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JourneyEnrollment" ADD CONSTRAINT "JourneyEnrollment_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JourneyEnrollment" ADD CONSTRAINT "JourneyEnrollment_enrolledByUserId_fkey" FOREIGN KEY ("enrolledByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JourneyEnrollment" ADD CONSTRAINT "JourneyEnrollment_workflowRunId_fkey" FOREIGN KEY ("workflowRunId") REFERENCES "WorkflowRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JourneyMilestoneCompletion" ADD CONSTRAINT "JourneyMilestoneCompletion_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JourneyMilestoneCompletion" ADD CONSTRAINT "JourneyMilestoneCompletion_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "JourneyEnrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JourneyMilestoneCompletion" ADD CONSTRAINT "JourneyMilestoneCompletion_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "JourneyMilestone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JourneyMilestoneCompletion" ADD CONSTRAINT "JourneyMilestoneCompletion_completedByUserId_fkey" FOREIGN KEY ("completedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
