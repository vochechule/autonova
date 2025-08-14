/*
  Warnings:

  - Added the required column `contactEmail` to the `Ad` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactPhone` to the `Ad` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Ad" ADD COLUMN     "contactEmail" TEXT NOT NULL,
ADD COLUMN     "contactName" TEXT,
ADD COLUMN     "contactPhone" TEXT NOT NULL,
ALTER COLUMN "airConditioning" DROP NOT NULL,
ALTER COLUMN "euroStandard" DROP NOT NULL;
