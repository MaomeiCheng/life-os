-- CreateTable
CREATE TABLE "MusicCard" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "timelineIndex" INTEGER,
    "pendingId" TEXT,
    "videoUrl" TEXT NOT NULL,
    "thumbUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MusicCard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MusicCard_timelineIndex_idx" ON "MusicCard"("timelineIndex");

-- CreateIndex
CREATE INDEX "MusicCard_pendingId_idx" ON "MusicCard"("pendingId");
