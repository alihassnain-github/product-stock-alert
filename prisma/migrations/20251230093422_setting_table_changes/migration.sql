/*
  Warnings:

  - Made the column `notificationEmail` on table `setting` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `setting` MODIFY `notificationEmail` VARCHAR(191) NOT NULL;
