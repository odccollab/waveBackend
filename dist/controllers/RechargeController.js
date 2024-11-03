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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../prisma"));
const TransactionController_1 = __importDefault(require("./TransactionController"));
class RechargeController {
    constructor() {
        this.transactionController = new TransactionController_1.default();
    }
    // Recharger le compte Wave depuis le compte bancaire
    chargFromBank(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { userBankId, amount } = req.body;
                const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) ? parseInt(req.user.id, 10) : null;
                if (!userId) {
                    return res.status(400).json({ error: 'Utilisateur non authentifié.' });
                }
                if (!userBankId || !amount || amount <= 0) {
                    return res.status(400).json({
                        error: 'ID du compte bancaire et montant requis, le montant doit être positif.',
                    });
                }
                const user = yield prisma_1.default.user.findUnique({ where: { id: userId } });
                if (!user) {
                    return res.status(404).json({ error: 'Utilisateur introuvable.' });
                }
                const userBank = yield prisma_1.default.userBank.findUnique({
                    where: { userId_bankId: { userId, bankId: userBankId } },
                });
                if (!userBank) {
                    return res.status(404).json({ error: 'Compte bancaire introuvable pour cet utilisateur.' });
                }
                if (userBank.solde < amount) {
                    return res.status(400).json({ error: 'Solde insuffisant sur le compte bancaire.' });
                }
                if (user.solde + amount > user.plafond) {
                    return res.status(400).json({
                        error: `Le montant dépasse le plafond autorisé de ${user.plafond}`,
                    });
                }
                const transactionResult = yield prisma_1.default.$transaction((prisma) => __awaiter(this, void 0, void 0, function* () {
                    yield prisma.userBank.update({
                        where: { userId_bankId: { userId, bankId: userBankId } },
                        data: { solde: { decrement: amount } },
                    });
                    const result = yield TransactionController_1.default.transaction(user, amount, 'from_bank', user.telephone);
                    if (typeof result === 'string') {
                        throw new Error(result);
                    }
                    return result;
                }));
                res.status(201).json({
                    message: 'Compte Wave rechargé avec succès',
                    transaction: transactionResult,
                });
            }
            catch (error) {
                console.error(error);
                res.status(500).json({
                    error: 'Erreur lors du rechargement du compte Wave depuis la banque',
                });
            }
        });
    }
    // Recharger le compte bancaire depuis le compte Wave
    chargFromWave(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { userBankId, amount } = req.body;
                const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) ? parseInt(req.user.id, 10) : null;
                if (!userId) {
                    return res.status(400).json({ error: 'Utilisateur non authentifié.' });
                }
                if (!userBankId || !amount || amount <= 0) {
                    return res.status(400).json({
                        error: 'ID du compte bancaire et montant requis, montant doit être positif',
                    });
                }
                const user = yield prisma_1.default.user.findUnique({ where: { id: userId } });
                if (!user) {
                    return res.status(404).json({ error: 'Utilisateur introuvable.' });
                }
                const userBank = yield prisma_1.default.userBank.findUnique({
                    where: { userId_bankId: { userId, bankId: userBankId } },
                });
                if (!userBank) {
                    return res.status(404).json({ error: 'Compte bancaire introuvable pour cet utilisateur.' });
                }
                if (user.solde < amount) {
                    return res.status(400).json({ error: 'Solde insuffisant sur le compte Wave' });
                }
                yield prisma_1.default.userBank.update({
                    where: { userId_bankId: { userId, bankId: userBankId } },
                    data: { solde: { increment: amount } },
                });
                const transactionResult = yield TransactionController_1.default.transaction(user, amount, 'from_wave', user.telephone);
                if (typeof transactionResult === 'string') {
                    return res.status(400).json({ error: transactionResult });
                }
                res.status(201).json({ message: 'Compte bancaire rechargé avec succès', transaction: transactionResult });
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Erreur lors du rechargement du compte bancaire depuis Wave' });
            }
        });
    }
    // Récupérer toutes les transactions de l'utilisateur connecté
    getTransactions(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = parseInt(req.user.id); // Remplacez par `req.userId` dans un contexte authentifié
            console.log(userId);
            try {
                const transactions = yield prisma_1.default.transactions.findMany({
                    where: {
                        OR: [
                            { senderId: userId },
                            { receiverId: userId }
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
                    data: null,
                    message: "Erreur lors de la récupération des transactions"
                });
            }
        });
    }
}
exports.default = new RechargeController();
