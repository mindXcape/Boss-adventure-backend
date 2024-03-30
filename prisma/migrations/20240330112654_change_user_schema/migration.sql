/*
  Warnings:

  - The values [USER,ACCOUNT,DRIVER,MANAGER,MD,SUPPORT,RECEPTIONIST] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `updatedAt` to the `banks` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Designation" AS ENUM ('ACCOUNT', 'DRIVER', 'MANAGER', 'MD', 'SUPPORT', 'RECEPTIONIST');

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('ADMIN', 'CLIENT', 'GUIDE', 'LEADER');
ALTER TABLE "admins" ALTER COLUMN "roles" DROP DEFAULT;
ALTER TABLE "admins" ALTER COLUMN "roles" TYPE "Role_new"[] USING ("roles"::text::"Role_new"[]);
ALTER TABLE "user_roles" ALTER COLUMN "roleId" TYPE "Role_new" USING ("roleId"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
ALTER TABLE "admins" ALTER COLUMN "roles" SET DEFAULT ARRAY['CLIENT']::"Role"[];
COMMIT;

-- AlterTable
ALTER TABLE "admins" ALTER COLUMN "roles" SET DEFAULT ARRAY['CLIENT']::"Role"[];

-- AlterTable
ALTER TABLE "banks" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "designation" "Designation";
