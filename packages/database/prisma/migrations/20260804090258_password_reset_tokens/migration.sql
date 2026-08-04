-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrayerWallPasswordResetToken" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrayerWallPasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PrayerWallPasswordResetToken_token_key" ON "PrayerWallPasswordResetToken"("token");

-- CreateIndex
CREATE INDEX "PrayerWallPasswordResetToken_organizationId_idx" ON "PrayerWallPasswordResetToken"("organizationId");

-- CreateIndex
CREATE INDEX "PrayerWallPasswordResetToken_accountId_idx" ON "PrayerWallPasswordResetToken"("accountId");

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrayerWallPasswordResetToken" ADD CONSTRAINT "PrayerWallPasswordResetToken_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrayerWallPasswordResetToken" ADD CONSTRAINT "PrayerWallPasswordResetToken_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "PrayerWallAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
