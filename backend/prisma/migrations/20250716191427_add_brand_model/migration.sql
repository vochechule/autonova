/*
  Warnings:

  - Added the required column `brand` to the `Ad` table without a default value. This is not possible if the table is not empty.
  - Added the required column `model` to the `Ad` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Ad" ADD COLUMN     "brand" TEXT NOT NULL,
ADD COLUMN     "model" TEXT NOT NULL;
