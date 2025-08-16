-- CreateIndex
CREATE INDEX "Ad_latitude_longitude_idx" ON "Ad"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "Ad_createdAt_idx" ON "Ad"("createdAt");
