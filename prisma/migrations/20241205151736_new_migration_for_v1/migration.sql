-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'CLIENT', 'GUIDE', 'LEADER', 'PORTER', 'ASST_GUIDE');

-- CreateEnum
CREATE TYPE "Designation" AS ENUM ('ACCOUNT', 'DRIVER', 'MANAGER', 'MD', 'SUPPORT', 'RECEPTIONIST');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'INACTIVE', 'BLOCKED');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "profileImage" TEXT,
    "roles" "Role"[] DEFAULT ARRAY['CLIENT']::"Role"[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "lastLoggedIn" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "profileImage" TEXT,
    "gender" TEXT,
    "status" "Status" DEFAULT 'ACTIVE',
    "dob" TIMESTAMP(3),
    "bankId" TEXT,
    "accountNumber" TEXT,
    "designation" "Designation",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banks" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "class" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "banks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "userId" TEXT NOT NULL,
    "roleId" "Role" NOT NULL,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("userId","roleId")
);

-- CreateTable
CREATE TABLE "addresses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "country" TEXT,
    "state" TEXT,
    "city" TEXT,
    "address" TEXT,
    "zipCode" TEXT,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "professional_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyName" TEXT,
    "passportNumber" TEXT,
    "passportExpire" TIMESTAMP(3),
    "citizenNumber" TEXT,
    "panNumber" TEXT,
    "guide_license" TEXT,
    "nma" TIMESTAMP(3),

    CONSTRAINT "professional_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hotels" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hotels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hotel_branches" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "state" TEXT,
    "city" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "poc" TEXT,
    "pocPhone" TEXT,
    "pocDesignation" TEXT,
    "email" TEXT,
    "hotelId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hotel_branches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lodges" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lodges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lodge_branches" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "state" TEXT,
    "city" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "poc" TEXT,
    "pocPhone" TEXT,
    "pocDesignation" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lodgeId" TEXT NOT NULL,

    CONSTRAINT "lodge_branches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "franchises" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "franchises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "franchise_packages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "description" JSONB NOT NULL,
    "franchiseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "franchise_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "groups" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users_on_group" (
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rooms" TEXT,
    "extension" TEXT,

    CONSTRAINT "users_on_group_pkey" PRIMARY KEY ("groupId","userId")
);

-- CreateTable
CREATE TABLE "pms" (
    "id" TEXT NOT NULL,
    "groupId" TEXT,
    "leaderId" TEXT,
    "guideId" TEXT,
    "packageId" TEXT,
    "customPackage" JSONB,
    "additionalInfo" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "meal" TEXT NOT NULL,
    "hotelId" TEXT,
    "comment" TEXT DEFAULT '',
    "lodgeId" TEXT,
    "groupId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_bookings" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "comment" TEXT,
    "vehicleId" TEXT,
    "driverId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "model" TEXT,
    "image" TEXT,
    "number" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "addresses_userId_key" ON "addresses"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "professional_profiles_userId_key" ON "professional_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "franchise_packages_name_key" ON "franchise_packages"("name");

-- CreateIndex
CREATE UNIQUE INDEX "groups_groupId_key" ON "groups"("groupId");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_number_key" ON "vehicles"("number");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "banks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professional_profiles" ADD CONSTRAINT "professional_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hotel_branches" ADD CONSTRAINT "hotel_branches_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "hotels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lodge_branches" ADD CONSTRAINT "lodge_branches_lodgeId_fkey" FOREIGN KEY ("lodgeId") REFERENCES "lodges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "franchise_packages" ADD CONSTRAINT "franchise_packages_franchiseId_fkey" FOREIGN KEY ("franchiseId") REFERENCES "franchises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_on_group" ADD CONSTRAINT "users_on_group_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_on_group" ADD CONSTRAINT "users_on_group_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pms" ADD CONSTRAINT "pms_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("groupId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pms" ADD CONSTRAINT "pms_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pms" ADD CONSTRAINT "pms_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pms" ADD CONSTRAINT "pms_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "franchise_packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "hotel_branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_lodgeId_fkey" FOREIGN KEY ("lodgeId") REFERENCES "lodge_branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("groupId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_bookings" ADD CONSTRAINT "vehicle_bookings_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_bookings" ADD CONSTRAINT "vehicle_bookings_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
