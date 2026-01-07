/*
  Warnings:

  - Added the required column `productTitle` to the `AlertProduct` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `AlertProduct_shop_idx` ON `alertproduct`;

-- AlterTable
ALTER TABLE `alertproduct` ADD COLUMN `productTitle` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE INDEX `AlertProduct_shop_productTitle_idx` ON `AlertProduct`(`shop`, `productTitle`);
