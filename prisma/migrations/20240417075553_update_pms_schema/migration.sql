-- DropForeignKey
ALTER TABLE "pms" DROP CONSTRAINT "pms_groupCode_fkey";

-- AddForeignKey
ALTER TABLE "pms" ADD CONSTRAINT "pms_groupCode_fkey" FOREIGN KEY ("groupCode") REFERENCES "groups"("groupId") ON DELETE SET NULL ON UPDATE CASCADE;
