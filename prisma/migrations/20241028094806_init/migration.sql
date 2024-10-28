-- CreateTable
CREATE TABLE "User" (
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

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notifications" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "read_at" TIMESTAMP(3),
    "date" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transactions" (
    "id" SERIAL NOT NULL,
    "paiement" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "solde_sender" DOUBLE PRECISION NOT NULL,
    "solde_receiver" DOUBLE PRECISION NOT NULL,
    "frais" DOUBLE PRECISION NOT NULL,
    "type" TEXT NOT NULL,
    "identifiant" TEXT NOT NULL,
    "senderId" INTEGER,
    "senderString" TEXT,
    "receiverId" INTEGER,
    "receiverString" TEXT,

    CONSTRAINT "Transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompteBank" (
    "id" SERIAL NOT NULL,
    "numero" TEXT NOT NULL,
    "nom_bank" TEXT NOT NULL,
    "solde" DOUBLE PRECISION NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "CompteBank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContenuMedia" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "ContenuMedia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_identifiant_key" ON "User"("identifiant");

-- CreateIndex
CREATE UNIQUE INDEX "User_mail_key" ON "User"("mail");

-- CreateIndex
CREATE UNIQUE INDEX "User_telephone_key" ON "User"("telephone");

-- CreateIndex
CREATE INDEX "Notifications_userId_idx" ON "Notifications"("userId");

-- CreateIndex
CREATE INDEX "Transactions_senderId_idx" ON "Transactions"("senderId");

-- CreateIndex
CREATE INDEX "Transactions_receiverId_idx" ON "Transactions"("receiverId");

-- CreateIndex
CREATE UNIQUE INDEX "CompteBank_numero_key" ON "CompteBank"("numero");

-- CreateIndex
CREATE INDEX "CompteBank_userId_idx" ON "CompteBank"("userId");

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompteBank" ADD CONSTRAINT "CompteBank_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContenuMedia" ADD CONSTRAINT "ContenuMedia_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
