-- CreateTable
CREATE TABLE "DemoRequest" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "churchName" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "churchWebsite" TEXT,
    "attendanceRange" TEXT NOT NULL,
    "campusCount" TEXT,
    "currentPlatform" TEXT,
    "contentPlatforms" TEXT,
    "message" TEXT,
    "preferredContact" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DemoRequest_pkey" PRIMARY KEY ("id")
);

