-- AlterTable
ALTER TABLE "Ad" ADD COLUMN     "assistSystems" TEXT,
ADD COLUMN     "interiorComfort" TEXT,
ADD COLUMN     "safetyFeatures" TEXT,
ADD COLUMN     "securityFeatures" TEXT,
ALTER COLUMN "airbagCount" DROP NOT NULL,
ALTER COLUMN "airbagCount" DROP DEFAULT;
