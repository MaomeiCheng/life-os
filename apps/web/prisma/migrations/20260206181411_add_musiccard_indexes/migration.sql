-- CreateIndex
CREATE INDEX "MusicCard_timelineIndex_createdAt_idx" ON "MusicCard"("timelineIndex", "createdAt");

-- CreateIndex
CREATE INDEX "MusicCard_pendingId_createdAt_idx" ON "MusicCard"("pendingId", "createdAt");
