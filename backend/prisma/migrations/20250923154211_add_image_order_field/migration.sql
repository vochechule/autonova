-- AlterTable
ALTER TABLE "Image" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Image_adId_order_idx" ON "Image"("adId", "order");
