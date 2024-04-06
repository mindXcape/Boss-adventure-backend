/*
  Warnings:

  - You are about to drop the column `image` on the `hotel_branches` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `lodge_branches` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "hotel_branches" DROP COLUMN "image";

-- AlterTable
ALTER TABLE "hotels" ADD COLUMN     "image" TEXT;

-- AlterTable
ALTER TABLE "lodge_branches" DROP COLUMN "image";

-- AlterTable
ALTER TABLE "lodges" ADD COLUMN     "image" TEXT;
