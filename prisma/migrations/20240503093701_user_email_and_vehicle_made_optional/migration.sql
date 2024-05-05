-- DropIndex
DROP INDEX "users_email_key";

-- DropIndex
DROP INDEX "vehicles_number_key";

-- AlterTable
ALTER TABLE "vehicles" ALTER COLUMN "number" DROP NOT NULL;
