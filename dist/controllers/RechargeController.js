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
    // Recharger le compte Wave depuis un compte bancaire
    // Recharger le compte Wave depuis un compte bancaire
    chargFromBank(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { bankAccountId, amount } = req.body;
                const userId = 1; // Remplacez par `req.userId` dans un contexte authentifié
                if (!bankAccountId || !amount || amount <= 0) {
                    return res.status(400).json({
                        error: 'ID du compte bancaire et montant requis, montant doit être positif',
                    });
                }
                const user = yield prisma_1.default.user.findUnique({ where: { id: userId } });
                const bankAccount = yield prisma_1.default.compteBank.findUnique({
                    where: { id: bankAccountId },
                });
                if (!user || !bankAccount || bankAccount.userId !== userId) {
                    return res.status(404).json({ error: 'Utilisateur ou compte bancaire introuvable' });
                }
                if (bankAccount.solde < amount) {
                    return res.status(400).json({ error: 'Solde insuffisant sur le compte bancaire' });
                }
                // Vérification si la recharge dépasse le plafond de l'utilisateur
                if (user.solde + amount > user.plafond) {
                    return res.status(400).json({
                        error: `Le montant dépasse le plafond autorisé de ${user.plafond}`,
                    });
                }
                // Effectuer la transaction en décrémentant le solde du compte bancaire
                const transactionResult = yield prisma_1.default.$transaction((prisma) => __awaiter(this, void 0, void 0, function* () {
                    yield prisma.compteBank.update({
                        where: { id: bankAccountId },
                        data: { solde: { decrement: amount } },
                    });
                    const result = yield this.transactionController.transaction(user, amount, 'from_bank', user.telephone);
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
            try {
                const { bankAccountId, amount } = req.body;
                const userId = 1; // Remplacez par `req.userId` dans un contexte authentifié
                if (!bankAccountId || !amount || amount <= 0) {
                    return res.status(400).json({
                        error: 'ID du compte bancaire et montant requis, montant doit être positif',
                    });
                }
                const user = yield prisma_1.default.user.findUnique({ where: { id: userId } });
                const bankAccount = yield prisma_1.default.compteBank.findUnique({
                    where: { id: bankAccountId },
                });
                if (!user || !bankAccount || bankAccount.userId !== userId) {
                    return res.status(404).json({ error: 'Utilisateur ou compte bancaire introuvable' });
                }
                if (user.solde < amount) {
                    return res.status(400).json({ error: 'Solde insuffisant sur le compte Wave' });
                }
                // Mise à jour du solde du compte bancaire
                yield prisma_1.default.compteBank.update({
                    where: { id: bankAccountId },
                    data: { solde: { increment: amount } },
                });
                // Appel de la méthode transaction du TransactionController
                const transactionResult = yield this.transactionController.transaction(user, amount, 'from_wave', user.telephone // Assurez-vous que c'est le numéro correct pour le receiver
                );
                if (typeof transactionResult === 'string') {
                    // Si la méthode retourne une chaîne, cela signifie qu'il y a une erreur
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
}
exports.default = new RechargeController();
