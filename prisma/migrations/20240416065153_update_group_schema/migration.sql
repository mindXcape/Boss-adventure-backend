-- DropForeignKey
ALTER TABLE "users_on_group" DROP CONSTRAINT "users_on_group_groupId_fkey";

-- DropForeignKey
ALTER TABLE "users_on_group" DROP CONSTRAINT "users_on_group_userId_fkey";

-- AddForeignKey
ALTER TABLE "users_on_group" ADD CONSTRAINT "users_on_group_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_on_group" ADD CONSTRAINT "users_on_group_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
