/*
  Warnings:

  - The primary key for the `Ad` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `body` on the `Ad` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `Ad` table. All the data in the column will be lost.
  - You are about to drop the column `doors` on the `Ad` table. All the data in the column will be lost.
  - You are about to drop the column `drive` on the `Ad` table. All the data in the column will be lost.
  - You are about to drop the column `engineSize` on the `Ad` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Ad` table. All the data in the column will be lost.
  - You are about to drop the column `seats` on the `Ad` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Ad` table. All the data in the column will be lost.
  - You are about to drop the column `vin` on the `Ad` table. All the data in the column will be lost.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Photo` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `airConditioning` to the `Ad` table without a default value. This is not possible if the table is not empty.
  - Added the required column `airbagCount` to the `Ad` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bodyType` to the `Ad` table without a default value. This is not possible if the table is not empty.
  - Added the required column `countryOfOrigin` to the `Ad` table without a default value. This is not possible if the table is not empty.
  - Added the required column `doorCount` to the `Ad` table without a default value. This is not possible if the table is not empty.
  - Added the required column `drivetrain` to the `Ad` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ecoTaxPaid` to the `Ad` table without a default value. This is not possible if the table is not empty.
  - Added the required column `engineVolume` to the `Ad` table without a default value. This is not possible if the table is not empty.
  - Added the required column `euroStandard` to the `Ad` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hasServiceBook` to the `Ad` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isDisabledAdapted` to the `Ad` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isFirstOwner` to the `Ad` table without a default value. This is not possible if the table is not empty.
  - Added the required column `seatCount` to the `Ad` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wasCrashed` to the `Ad` table without a default value. This is not possible if the table is not empty.
  - Made the column `color` on table `Ad` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `condition` to the `Ad` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fuel` to the `Ad` table without a default value. This is not possible if the table is not empty.
  - Made the column `power` on table `Ad` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `transmission` to the `Ad` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BodyType" AS ENUM ('hatchback', 'sedan', 'kombi', 'suv', 'coupe', 'cabrio', 'mpv', 'pickup', 'van', 'jiné');

-- CreateEnum
CREATE TYPE "AirConditioning" AS ENUM ('none', 'manual', 'automatic', 'two_zone', 'three_zone');

-- CreateEnum
CREATE TYPE "FuelType" AS ENUM ('petrol', 'diesel', 'hybrid', 'electric', 'lpg', 'cng');

-- CreateEnum
CREATE TYPE "Transmission" AS ENUM ('manual', 'automatic', 'semi_automatic');

-- CreateEnum
CREATE TYPE "Drivetrain" AS ENUM ('fwd', 'rwd', 'awd', 'four_x_four');

-- CreateEnum
CREATE TYPE "EmissionClass" AS ENUM ('euro1', 'euro2', 'euro3', 'euro4', 'euro5', 'euro6', 'euro6d');

-- CreateEnum
CREATE TYPE "CarCondition" AS ENUM ('new', 'used', 'crashed', 'demo');

-- DropForeignKey
ALTER TABLE "Ad" DROP CONSTRAINT "Ad_userId_fkey";

-- DropForeignKey
ALTER TABLE "Photo" DROP CONSTRAINT "Photo_adId_fkey";

-- AlterTable
ALTER TABLE "Ad" DROP CONSTRAINT "Ad_pkey",
DROP COLUMN "body",
DROP COLUMN "country",
DROP COLUMN "doors",
DROP COLUMN "drive",
DROP COLUMN "engineSize",
DROP COLUMN "location",
DROP COLUMN "seats",
DROP COLUMN "updatedAt",
DROP COLUMN "vin",
ADD COLUMN     "airConditioning" "AirConditioning" NOT NULL,
ADD COLUMN     "airbagCount" INTEGER NOT NULL,
ADD COLUMN     "avgConsumption" DOUBLE PRECISION,
ADD COLUMN     "bodyType" "BodyType" NOT NULL,
ADD COLUMN     "colorFinish" TEXT,
ADD COLUMN     "countryOfOrigin" TEXT NOT NULL,
ADD COLUMN     "doorCount" INTEGER NOT NULL,
ADD COLUMN     "drivetrain" "Drivetrain" NOT NULL,
ADD COLUMN     "ecoTaxPaid" BOOLEAN NOT NULL,
ADD COLUMN     "engineVolume" INTEGER NOT NULL,
ADD COLUMN     "euroStandard" "EmissionClass" NOT NULL,
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "firstRegistration" INTEGER,
ADD COLUMN     "gearCount" INTEGER,
ADD COLUMN     "hasServiceBook" BOOLEAN NOT NULL,
ADD COLUMN     "isDisabledAdapted" BOOLEAN NOT NULL,
ADD COLUMN     "isFirstOwner" BOOLEAN NOT NULL,
ADD COLUMN     "isVisible" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "seatCount" INTEGER NOT NULL,
ADD COLUMN     "technicalCheckUntil" TIMESTAMP(3),
ADD COLUMN     "views" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "warrantyUntil" TIMESTAMP(3),
ADD COLUMN     "wasCrashed" BOOLEAN NOT NULL,
ADD COLUMN     "windowNote" TEXT,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ALTER COLUMN "year" DROP NOT NULL,
ALTER COLUMN "color" SET NOT NULL,
DROP COLUMN "condition",
ADD COLUMN     "condition" "CarCondition" NOT NULL,
DROP COLUMN "fuel",
ADD COLUMN     "fuel" "FuelType" NOT NULL,
ALTER COLUMN "power" SET NOT NULL,
DROP COLUMN "transmission",
ADD COLUMN     "transmission" "Transmission" NOT NULL,
ADD CONSTRAINT "Ad_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Ad_id_seq";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "name",
ADD COLUMN     "isDealer" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- DropTable
DROP TABLE "Photo";

-- CreateTable
CREATE TABLE "CarFeature" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "CarFeature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Image" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "adId" TEXT NOT NULL,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "userId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AdFeatures" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AdFeatures_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "CarFeature_name_key" ON "CarFeature"("name");

-- CreateIndex
CREATE INDEX "_AdFeatures_B_index" ON "_AdFeatures"("B");

-- AddForeignKey
ALTER TABLE "Ad" ADD CONSTRAINT "Ad_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_adId_fkey" FOREIGN KEY ("adId") REFERENCES "Ad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AdFeatures" ADD CONSTRAINT "_AdFeatures_A_fkey" FOREIGN KEY ("A") REFERENCES "Ad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AdFeatures" ADD CONSTRAINT "_AdFeatures_B_fkey" FOREIGN KEY ("B") REFERENCES "CarFeature"("id") ON DELETE CASCADE ON UPDATE CASCADE;
