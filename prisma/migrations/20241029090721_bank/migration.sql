/*
  Warnings:

  - You are about to drop the `UserBank` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserBank" DROP CONSTRAINT "UserBank_bankId_fkey";

-- DropForeignKey
ALTER TABLE "UserBank" DROP CONSTRAINT "UserBank_userId_fkey";

-- DropTable
DROP TABLE "UserBank";

-- CreateTable
CREATE TABLE "user_bank" (
    "userId" INTEGER NOT NULL,
    "bankId" INTEGER NOT NULL,
    "solde" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "user_bank_pkey" PRIMARY KEY ("userId","bankId")
);

-- AddForeignKey
ALTER TABLE "user_bank" ADD CONSTRAINT "user_bank_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_bank" ADD CONSTRAINT "user_bank_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "bank"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
