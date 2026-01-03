/*
  Warnings:

  - Added the required column `inventoryItem` to the `AlertProduct` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `alertproduct` ADD COLUMN `inventoryItem` VARCHAR(191) NOT NULL;
