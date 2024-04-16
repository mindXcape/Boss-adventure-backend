/*
  Warnings:

  - A unique constraint covering the columns `[group_id]` on the table `groups` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `group_id` to the `groups` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "groups" ADD COLUMN     "group_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "groups_group_id_key" ON "groups"("group_id");
