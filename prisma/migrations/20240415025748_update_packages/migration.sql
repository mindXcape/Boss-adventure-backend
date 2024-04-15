/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `franchise_packages` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `meal` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `franchise_packages` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `duration` to the `franchise_packages` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "meal" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "franchise_packages" ALTER COLUMN "name" SET NOT NULL,
DROP COLUMN "duration",
ADD COLUMN     "duration" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "franchise_packages_name_key" ON "franchise_packages"("name");
