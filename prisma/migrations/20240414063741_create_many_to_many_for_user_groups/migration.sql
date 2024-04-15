/*
  Warnings:

  - You are about to drop the column `clientIds` on the `groups` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `groups` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "groups" DROP CONSTRAINT "groups_userId_fkey";

-- AlterTable
ALTER TABLE "groups" DROP COLUMN "clientIds",
DROP COLUMN "userId";

-- CreateTable
CREATE TABLE "users_on_group" (
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "users_on_group_pkey" PRIMARY KEY ("groupId","userId")
);

-- AddForeignKey
ALTER TABLE "users_on_group" ADD CONSTRAINT "users_on_group_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_on_group" ADD CONSTRAINT "users_on_group_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
