-- CreateTable
CREATE TABLE "bank" (
    "id" SERIAL NOT NULL,
    "nom_bank" TEXT NOT NULL,
    "photo" TEXT NOT NULL,

    CONSTRAINT "bank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBank" (
    "userId" INTEGER NOT NULL,
    "bankId" INTEGER NOT NULL,
    "solde" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "UserBank_pkey" PRIMARY KEY ("userId","bankId")
);

-- CreateIndex
CREATE UNIQUE INDEX "bank_nom_bank_key" ON "bank"("nom_bank");

-- AddForeignKey
ALTER TABLE "UserBank" ADD CONSTRAINT "UserBank_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBank" ADD CONSTRAINT "UserBank_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "bank"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
