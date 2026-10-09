-- CreateEnum
CREATE TYPE "CampusLocationType" AS ENUM ('BUILDING', 'DEPARTMENT', 'OFFICE', 'FACULTY_CABIN', 'SERVICE', 'OTHER');

-- CreateTable
CREATE TABLE "CampusLocation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CampusLocationType" NOT NULL,
    "description" TEXT,
    "building" TEXT,
    "floor" TEXT,
    "roomNumber" TEXT,
    "contact" TEXT,
    "email" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampusLocation_pkey" PRIMARY KEY ("id")
);
