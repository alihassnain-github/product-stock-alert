/*
  Warnings:

  - You are about to alter the column `alertFrequency` on the `alertproduct` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(0))` to `Enum(EnumId(0))`.

*/
-- AlterTable
ALTER TABLE `alertproduct` MODIFY `alertFrequency` ENUM('once', 'always') NOT NULL DEFAULT 'once';
