-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'PORTER';
ALTER TYPE "Role" ADD VALUE 'ASST_GUIDE';

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "comment" TEXT DEFAULT '',
ADD COLUMN     "status" "BookingStatus" NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "model" TEXT,
    "image" TEXT,
    "number" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);
