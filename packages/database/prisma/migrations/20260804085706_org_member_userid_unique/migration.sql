-- DropIndex
DROP INDEX "OrganizationMember_organizationId_userId_key";

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationMember_userId_key" ON "OrganizationMember"("userId");
