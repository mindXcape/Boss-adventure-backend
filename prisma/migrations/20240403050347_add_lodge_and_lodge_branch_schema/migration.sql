-- CreateTable
CREATE TABLE "lodges" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lodges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lodge_branches" (
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lodgeId" TEXT NOT NULL,

    CONSTRAINT "lodge_branches_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "lodge_branches" ADD CONSTRAINT "lodge_branches_lodgeId_fkey" FOREIGN KEY ("lodgeId") REFERENCES "lodges"("id") ON DELETE CASCADE ON UPDATE CASCADE;
