/*
  Warnings:

  - You are about to drop the column `companyName` on the `professional_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `nationIdNumber` on the `professional_profiles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "professional_profiles" DROP COLUMN "companyName",
DROP COLUMN "nationIdNumber",
ADD COLUMN     "nationalIdNumber" TEXT;
