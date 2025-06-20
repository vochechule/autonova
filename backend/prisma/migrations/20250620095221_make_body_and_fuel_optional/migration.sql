-- AlterTable
ALTER TABLE "Ad" ADD COLUMN     "body" TEXT,
ADD COLUMN     "color" TEXT,
ADD COLUMN     "condition" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "doors" INTEGER,
ADD COLUMN     "drive" TEXT,
ADD COLUMN     "engineSize" DOUBLE PRECISION,
ADD COLUMN     "fuel" TEXT,
ADD COLUMN     "power" INTEGER,
ADD COLUMN     "seats" INTEGER,
ADD COLUMN     "transmission" TEXT,
ADD COLUMN     "vin" TEXT,
ALTER COLUMN "location" DROP NOT NULL;
