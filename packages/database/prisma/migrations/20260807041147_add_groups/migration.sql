-- CreateEnum
CREATE TYPE "GroupType" AS ENUM ('SMALL_GROUP', 'CLASS', 'MINISTRY_TEAM', 'SERVING_TEAM', 'OTHER');

-- CreateEnum
CREATE TYPE "GroupEnrollment" AS ENUM ('OPEN', 'REQUEST', 'INVITE_ONLY', 'CLOSED');

-- CreateEnum
CREATE TYPE "GroupMembershipRole" AS ENUM ('LEADER', 'CO_LEADER', 'MEMBER');

-- CreateTable
CREATE TABLE "Group" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "GroupType" NOT NULL DEFAULT 'SMALL_GROUP',
    "description" TEXT,
    "enrollment" "GroupEnrollment" NOT NULL DEFAULT 'OPEN',
    "meetingSchedule" TEXT,
    "meetingLocation" TEXT,
    "capacity" INTEGER,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "campusWebsiteId" TEXT,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupMembership" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "role" "GroupMembershipRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupMembership_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Group_organizationId_idx" ON "Group"("organizationId");

-- CreateIndex
CREATE INDEX "Group_organizationId_type_idx" ON "Group"("organizationId", "type");

-- CreateIndex
CREATE INDEX "Group_campusWebsiteId_idx" ON "Group"("campusWebsiteId");

-- CreateIndex
CREATE INDEX "GroupMembership_organizationId_idx" ON "GroupMembership"("organizationId");

-- CreateIndex
CREATE INDEX "GroupMembership_groupId_idx" ON "GroupMembership"("groupId");

-- CreateIndex
CREATE INDEX "GroupMembership_personId_idx" ON "GroupMembership"("personId");

-- CreateIndex
CREATE UNIQUE INDEX "GroupMembership_groupId_personId_key" ON "GroupMembership"("groupId", "personId");

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_campusWebsiteId_fkey" FOREIGN KEY ("campusWebsiteId") REFERENCES "Website"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMembership" ADD CONSTRAINT "GroupMembership_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMembership" ADD CONSTRAINT "GroupMembership_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMembership" ADD CONSTRAINT "GroupMembership_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;
