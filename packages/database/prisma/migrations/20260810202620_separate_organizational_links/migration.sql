/*
  Warnings:

  - You are about to drop the column `description` on the `ActionLink` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ActionLink" DROP COLUMN "description";

-- CreateTable
CREATE TABLE "OrganizationalLink" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationalLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrganizationalLink_organizationId_idx" ON "OrganizationalLink"("organizationId");

-- AddForeignKey
ALTER TABLE "OrganizationalLink" ADD CONSTRAINT "OrganizationalLink_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
