/*
  Warnings:

  - The values [semi_automatic] on the enum `Transmission` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Transmission_new" AS ENUM ('manual', 'automatic', 'cvt', 'sequential');
ALTER TABLE "Ad" ALTER COLUMN "transmission" TYPE "Transmission_new" USING ("transmission"::text::"Transmission_new");
ALTER TYPE "Transmission" RENAME TO "Transmission_old";
ALTER TYPE "Transmission_new" RENAME TO "Transmission";
DROP TYPE "Transmission_old";
COMMIT;
