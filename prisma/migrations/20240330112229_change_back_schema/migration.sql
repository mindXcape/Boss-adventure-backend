/*
  Warnings:

  - You are about to drop the `bank_details` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "bank_details" DROP CONSTRAINT "bank_details_userId_fkey";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "accountNumber" TEXT,
ADD COLUMN     "bankId" TEXT;

-- DropTable
DROP TABLE "bank_details";

-- CreateTable
CREATE TABLE "banks" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "class" TEXT,

    CONSTRAINT "banks_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "banks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
