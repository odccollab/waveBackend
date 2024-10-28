"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class TransactionController {
    // Récupérer toutes les transactions de l'utilisateur connecté
    static getTransactions(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = 1;
                const transactions = yield prisma.transactions.findMany({
                    where: {
                        OR: [
                            { senderId: +userId },
                            { receiverId: +userId }
                        ]
                    }
                });
                return res.status(200).json({
                    success: true,
                    data: transactions
                });
            }
            catch (error) {
                console.error('Erreur lors de la récupération des transactions:', error);
                return res.status(500).json({
                    success: false,
                    message: "Erreur lors de la récupération des transactions"
                });
            }
        });
    }
    // Récupérer une transaction spécifique par son ID
    static getTransactionById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const userId = 1;
                const transaction = yield prisma.transactions.findUnique({
                    where: { id: Number(id) }
                });
                if (!transaction) {
                    return res.status(404).json({
                        success: false,
                        message: "Transaction non trouvée"
                    });
                }
                // Vérifier que l'utilisateur est autorisé à voir cette transaction
                if (transaction.senderId !== Number(userId) && transaction.receiverId !== Number(userId)) {
                    return res.status(403).json({
                        success: false,
                        message: "Accès non autorisé à cette transaction"
                    });
                }
                return res.status(200).json({
                    success: true,
                    data: transaction
                });
            }
            catch (error) {
                console.error('Erreur lors de la récupération de la transaction:', error);
                return res.status(500).json({
                    success: false,
                    message: "Erreur lors de la récupération de la transaction"
                });
            }
        });
    }
    // Annuler une transaction
    static cancelTransaction(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const userId = 1;
                const transaction = yield prisma.transactions.findUnique({
                    where: { id: Number(id) }
                });
                if (!transaction) {
                    return res.status(404).json({
                        success: false,
                        message: "Transaction non trouvée"
                    });
                }
                // Vérifier que l'utilisateur est l'expéditeur de la transaction
                if (transaction.senderId !== Number(userId)) {
                    return res.status(403).json({
                        success: false,
                        message: "Seul l'expéditeur peut annuler la transaction"
                    });
                }
                // Vérifier si la transaction peut être annulée
                if (transaction.status === 'COMPLETED') {
                    return res.status(400).json({
                        success: false,
                        message: "Impossible d'annuler une transaction déjà complétée"
                    });
                }
                // Mettre à jour le statut de la transaction
                const updatedTransaction = yield prisma.transactions.update({
                    where: { id: Number(id) },
                    data: {
                        status: 'CANCELLED',
                        date: new Date()
                    }
                });
                return res.status(200).json({
                    success: true,
                    message: "Transaction annulée avec succès",
                    data: updatedTransaction
                });
            }
            catch (error) {
                console.error('Erreur lors de l\'annulation de la transaction:', error);
                return res.status(500).json({
                    success: false,
                    message: "Erreur lors de l'annulation de la transaction"
                });
            }
        });
    }
}
exports.default = TransactionController;
