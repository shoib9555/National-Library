/*
  Warnings:

  - You are about to drop the column `razorpayOrderId` on the `payment` table. All the data in the column will be lost.
  - You are about to drop the column `razorpayPaymentId` on the `payment` table. All the data in the column will be lost.
  - You are about to drop the column `razorpayQrId` on the `payment` table. All the data in the column will be lost.
  - The values [RAZORPAY] on the enum `Payment_paymentMethod` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `razorpaywebhookevent` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX `Payment_razorpayOrderId_key` ON `payment`;

-- DropIndex
DROP INDEX `Payment_razorpayPaymentId_key` ON `payment`;

-- DropIndex
DROP INDEX `Payment_razorpayQrId_key` ON `payment`;

-- AlterTable
ALTER TABLE `payment` DROP COLUMN `razorpayOrderId`,
    DROP COLUMN `razorpayPaymentId`,
    DROP COLUMN `razorpayQrId`,
    MODIFY `paymentMethod` ENUM('CASH', 'UPI') NOT NULL;

-- DropTable
DROP TABLE `razorpaywebhookevent`;
