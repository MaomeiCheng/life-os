-- CreateTable
CREATE TABLE "MusicEvent" (
    "id" TEXT NOT NULL,
    "eventDate" TEXT NOT NULL,
    "plannedCount" INTEGER NOT NULL,
    "decidedCount" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MusicEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MusicCrownItem" (
    "timelineIndex" INTEGER NOT NULL,
    "eventId" TEXT NOT NULL,
    "crownDate" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "cardReceivedDate" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "reason" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MusicCrownItem_pkey" PRIMARY KEY ("timelineIndex")
);

-- CreateTable
CREATE TABLE "MusicPending" (
    "pendingId" TEXT NOT NULL,
    "tempCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MusicPending_pkey" PRIMARY KEY ("pendingId")
);

-- AddForeignKey
ALTER TABLE "MusicCrownItem" ADD CONSTRAINT "MusicCrownItem_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "MusicEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
