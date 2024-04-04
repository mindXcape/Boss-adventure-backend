-- CreateTable
CREATE TABLE "hotels" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hotels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hotel_branches" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
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

-- AddForeignKey
ALTER TABLE "hotel_branches" ADD CONSTRAINT "hotel_branches_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "hotels"("id") ON DELETE CASCADE ON UPDATE CASCADE;
