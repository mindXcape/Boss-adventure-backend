-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_groupId_fkey";

-- AlterTable
ALTER TABLE "bookings" ALTER COLUMN "groupId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("groupId") ON DELETE SET NULL ON UPDATE CASCADE;
