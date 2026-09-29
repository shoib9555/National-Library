/*
  Warnings:

  - A unique constraint covering the columns `[razorpayQrId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `payment` ADD COLUMN `razorpayQrId` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Payment_razorpayQrId_key` ON `Payment`(`razorpayQrId`);
