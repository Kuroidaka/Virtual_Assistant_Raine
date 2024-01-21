/*
  Warnings:

  - You are about to drop the column `imgUrl` on the `Message` table. All the data in the column will be lost.
  - Added the required column `messageId` to the `ImageFile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ImageFile` ADD COLUMN `messageId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Message` DROP COLUMN `imgUrl`;

-- AddForeignKey
ALTER TABLE `ImageFile` ADD CONSTRAINT `ImageFile_messageId_fkey` FOREIGN KEY (`messageId`) REFERENCES `Message`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
