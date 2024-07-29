/*
  Warnings:

  - You are about to drop the column `cvImage` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `passportImage` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "cvImage",
DROP COLUMN "passportImage";
