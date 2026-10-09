/*
  Warnings:

  - Made the column `slotCode` on table `ScheduleEntry` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ScheduleEntry" ALTER COLUMN "slotCode" SET NOT NULL;
