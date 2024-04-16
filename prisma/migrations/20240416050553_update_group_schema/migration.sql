/*
  Warnings:

  - You are about to drop the column `group_id` on the `groups` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[groupId]` on the table `groups` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `groupId` to the `groups` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "groups_group_id_key";

-- AlterTable
ALTER TABLE "groups" DROP COLUMN "group_id",
ADD COLUMN     "groupId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "groups_groupId_key" ON "groups"("groupId");
