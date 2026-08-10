-- Church OS platform extraction: the church-management product (People, Groups,
-- Forms, Workflows, Tasks, Journeys, Events, Communications, Check-in, outbox)
-- moved to its own product/repository ("CMS"). Ruach returns to being the
-- content-discovery SaaS only. Prior migrations are kept so deployed databases
-- replay history correctly; this migration removes everything those platform
-- migrations created. DROP ... CASCADE handles inter-table FKs regardless of order.

DROP TABLE IF EXISTS "CheckIn" CASCADE;
DROP TABLE IF EXISTS "Message" CASCADE;
DROP TABLE IF EXISTS "EventRegistration" CASCADE;
DROP TABLE IF EXISTS "Event" CASCADE;
DROP TABLE IF EXISTS "JourneyMilestoneCompletion" CASCADE;
DROP TABLE IF EXISTS "JourneyEnrollment" CASCADE;
DROP TABLE IF EXISTS "JourneyMilestone" CASCADE;
DROP TABLE IF EXISTS "JourneyDefinition" CASCADE;
DROP TABLE IF EXISTS "Task" CASCADE;
DROP TABLE IF EXISTS "WorkflowRun" CASCADE;
DROP TABLE IF EXISTS "WorkflowVersion" CASCADE;
DROP TABLE IF EXISTS "WorkflowDefinition" CASCADE;
DROP TABLE IF EXISTS "ProcessedEvent" CASCADE;
DROP TABLE IF EXISTS "OutboxEvent" CASCADE;
DROP TABLE IF EXISTS "FormSubmission" CASCADE;
DROP TABLE IF EXISTS "FormVersion" CASCADE;
DROP TABLE IF EXISTS "FormDefinition" CASCADE;
DROP TABLE IF EXISTS "GroupMembership" CASCADE;
DROP TABLE IF EXISTS "Group" CASCADE;
DROP TABLE IF EXISTS "PersonRelationship" CASCADE;
DROP TABLE IF EXISTS "Person" CASCADE;
DROP TABLE IF EXISTS "Household" CASCADE;

DROP TYPE IF EXISTS "MessageStatus";
DROP TYPE IF EXISTS "MessageChannel";
DROP TYPE IF EXISTS "EventRegistrationStatus";
DROP TYPE IF EXISTS "EventRecurrence";
DROP TYPE IF EXISTS "JourneyEnrollmentStatus";
DROP TYPE IF EXISTS "TaskPriority";
DROP TYPE IF EXISTS "TaskStatus";
DROP TYPE IF EXISTS "WorkflowRunStatus";
DROP TYPE IF EXISTS "WorkflowStatus";
DROP TYPE IF EXISTS "OutboxStatus";
DROP TYPE IF EXISTS "FormStatus";
DROP TYPE IF EXISTS "GroupMembershipRole";
DROP TYPE IF EXISTS "GroupEnrollment";
DROP TYPE IF EXISTS "GroupType";
DROP TYPE IF EXISTS "PersonRelationshipType";
DROP TYPE IF EXISTS "HouseholdRole";
DROP TYPE IF EXISTS "MembershipStatus";

-- Public-surface URL key added for the platform's /c and /g pages.
ALTER TABLE "Organization" DROP COLUMN IF EXISTS "publicSiteId";
