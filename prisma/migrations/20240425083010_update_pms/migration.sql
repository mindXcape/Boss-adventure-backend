/*
  Warnings:

  - A unique constraint covering the columns `[number]` on the table `vehicles` will be added. If there are existing duplicate values, this will fail.
  - Made the column `number` on table `vehicles` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "pms" ADD COLUMN     "additionalInfo" JSONB;

-- AlterTable
ALTER TABLE "vehicles" ALTER COLUMN "number" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_number_key" ON "vehicles"("number");
