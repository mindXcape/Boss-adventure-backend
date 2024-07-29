/*
  Warnings:

  - You are about to drop the `addresses` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "addresses" DROP CONSTRAINT "addresses_userId_fkey";

-- AlterTable
ALTER TABLE "groups" ADD COLUMN     "groupImg" TEXT;

-- AlterTable
ALTER TABLE "professional_profiles" ADD COLUMN     "guide_license_Expire" TIMESTAMP(3),
ADD COLUMN     "nationIdNumber" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "address" TEXT,
ADD COLUMN     "category" TEXT,
ADD COLUMN     "cvImage" TEXT,
ADD COLUMN     "language" TEXT,
ADD COLUMN     "passportImage" TEXT;

-- DropTable
DROP TABLE "addresses";

-- CreateTable
CREATE TABLE "assets" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "citizenshipImg" TEXT,
    "panCardImg" TEXT,
    "nationIdImg" TEXT,
    "namBookImg" TEXT,
    "guideLicenseImg" TEXT,
    "cvImg" TEXT,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "assets_userId_key" ON "assets"("userId");

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
