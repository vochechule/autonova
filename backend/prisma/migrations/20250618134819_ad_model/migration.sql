/*
  Warnings:

  - Added the required column `location` to the `Ad` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mileage` to the `Ad` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Ad` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `Ad` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Ad" ADD COLUMN     "location" TEXT NOT NULL,
ADD COLUMN     "mileage" INTEGER NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "year" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Photo" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "adId" INTEGER NOT NULL,

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_adId_fkey" FOREIGN KEY ("adId") REFERENCES "Ad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
