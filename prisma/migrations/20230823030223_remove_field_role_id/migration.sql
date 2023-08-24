/*
  Warnings:

  - You are about to drop the column `roleId` on the `Permission` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Permission_roleId_fkey` ON `Permission`;

-- AlterTable
ALTER TABLE `Permission` DROP COLUMN `roleId`;
