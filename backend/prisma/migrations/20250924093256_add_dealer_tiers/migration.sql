-- CreateEnum
CREATE TYPE "DealerTier" AS ENUM ('BASIC', 'PREMIUM', 'ENTERPRISE');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "dealerTier" "DealerTier" NOT NULL DEFAULT 'BASIC',
ADD COLUMN     "tierUpgradedAt" TIMESTAMP(3);
