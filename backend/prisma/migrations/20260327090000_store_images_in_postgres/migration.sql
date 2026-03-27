ALTER TABLE "Image"
ADD COLUMN "storageKey" TEXT,
ADD COLUMN "filename" TEXT,
ADD COLUMN "mimeType" TEXT,
ADD COLUMN "size" INTEGER,
ADD COLUMN "originalSize" INTEGER,
ADD COLUMN "width" INTEGER,
ADD COLUMN "height" INTEGER,
ADD COLUMN "data" BYTEA;

UPDATE "Image"
SET "storageKey" = "id"
WHERE "storageKey" IS NULL;

ALTER TABLE "Image"
ALTER COLUMN "storageKey" SET NOT NULL;

CREATE UNIQUE INDEX "Image_storageKey_key" ON "Image"("storageKey");
