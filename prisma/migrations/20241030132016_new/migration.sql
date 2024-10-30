/*
  Warnings:

  - You are about to drop the `comptebank` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "comptebank" DROP CONSTRAINT "comptebank_userId_fkey";

-- DropTable
DROP TABLE "comptebank";

-- CreateTable
CREATE TABLE "bank" (
    "id" SERIAL NOT NULL,
    "nom_bank" TEXT NOT NULL,
    "photo" TEXT NOT NULL,

    CONSTRAINT "bank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_bank" (
    "userId" INTEGER NOT NULL,
    "bankId" INTEGER NOT NULL,
    "solde" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "user_bank_pkey" PRIMARY KEY ("userId","bankId")
);

-- CreateIndex
CREATE UNIQUE INDEX "bank_nom_bank_key" ON "bank"("nom_bank");

-- AddForeignKey
ALTER TABLE "user_bank" ADD CONSTRAINT "user_bank_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_bank" ADD CONSTRAINT "user_bank_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "bank"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
