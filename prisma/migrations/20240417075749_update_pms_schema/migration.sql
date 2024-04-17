/*
  Warnings:

  - You are about to drop the column `groupCode` on the `pms` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "pms" DROP CONSTRAINT "pms_groupCode_fkey";

-- AlterTable
ALTER TABLE "pms" DROP COLUMN "groupCode",
ADD COLUMN     "groupId" TEXT;

-- AddForeignKey
ALTER TABLE "pms" ADD CONSTRAINT "pms_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("groupId") ON DELETE SET NULL ON UPDATE CASCADE;
