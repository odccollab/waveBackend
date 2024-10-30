/*
  Warnings:

  - You are about to drop the `comptebank` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "comptebank" DROP CONSTRAINT "comptebank_userId_fkey";

-- DropTable
DROP TABLE "comptebank";
