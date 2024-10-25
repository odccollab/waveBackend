-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "identifiant" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "mail" TEXT NOT NULL,
    "codeSecret" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "solde" DOUBLE PRECISION NOT NULL,
    "photo" TEXT,
    "plafond" DOUBLE PRECISION,
    "type" TEXT NOT NULL,
    "type_societe" TEXT,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "read_at" TIMESTAMP(3),
    "readed" BOOLEAN NOT NULL DEFAULT false,
    "date" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction" (
    "id" SERIAL NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "solde_sender" DOUBLE PRECISION NOT NULL,
    "solde_receiver" DOUBLE PRECISION,
    "frais" DOUBLE PRECISION NOT NULL,
    "type" TEXT NOT NULL,
    "senderId" INTEGER NOT NULL,
    "receiverId" INTEGER,
    "receiverString" TEXT,

    CONSTRAINT "transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comptebank" (
    "id" SERIAL NOT NULL,
    "numero" TEXT NOT NULL,
    "nom_bank" TEXT NOT NULL,
    "solde" DOUBLE PRECISION NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "comptebank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contenumedia" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "contenumedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "contact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_identifiant_key" ON "user"("identifiant");

-- CreateIndex
CREATE UNIQUE INDEX "user_mail_key" ON "user"("mail");

-- CreateIndex
CREATE UNIQUE INDEX "user_telephone_key" ON "user"("telephone");

-- CreateIndex
CREATE INDEX "notification_userId_idx" ON "notification"("userId");

-- CreateIndex
CREATE INDEX "transaction_senderId_idx" ON "transaction"("senderId");

-- CreateIndex
CREATE INDEX "transaction_receiverId_idx" ON "transaction"("receiverId");

-- CreateIndex
CREATE UNIQUE INDEX "comptebank_numero_key" ON "comptebank"("numero");

-- CreateIndex
CREATE INDEX "comptebank_userId_idx" ON "comptebank"("userId");

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comptebank" ADD CONSTRAINT "comptebank_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contenumedia" ADD CONSTRAINT "contenumedia_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact" ADD CONSTRAINT "contact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
