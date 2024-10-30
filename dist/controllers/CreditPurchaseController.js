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
exports.creditPurchaseController = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const TransactionController_1 = __importDefault(require("./TransactionController"));
class CreditPurchaseController {
    constructor() {
        this.purchaseCredit = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { telephone, montant, operateur, userId } = req.body;
                // Validation des données
                if (!telephone || !montant || !operateur || !userId) {
                    return res.status(400).json({
                        success: false,
                        message: 'Tous les champs sont obligatoires'
                    });
                }
                // Validation du montant minimum
                if (montant < 500) {
                    return res.status(400).json({
                        success: false,
                        message: 'Le montant minimum est de 500'
                    });
                }
                // Récupération de l'utilisateur
                const user = yield prisma_1.default.user.findUnique({
                    where: { id: userId }
                });
                if (!user) {
                    return res.status(404).json({
                        success: false,
                        message: 'Utilisateur non trouvé'
                    });
                }
                // Vérification du solde
                if (user.solde < montant) {
                    return res.status(400).json({
                        success: false,
                        message: 'Solde insuffisant'
                    });
                }
                // Validation de l'opérateur
                const operateurs = ['orange', 'expresso', 'free'];
                if (!operateurs.includes(operateur.toLowerCase())) {
                    return res.status(400).json({
                        success: false,
                        message: 'Opérateur non pris en charge'
                    });
                }
                // Validation du numéro
                if (!this.validatePhoneNumber(telephone, operateur)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Numéro de téléphone invalide pour cet opérateur'
                    });
                }
                // Calculer les frais (si nécessaire)
                const frais = 0; // ou votre logique de calcul des frais
                // Créer la transaction
                const transaction = yield prisma_1.default.transactions.create({
                    data: {
                        montant,
                        status: 'pending',
                        date: new Date(),
                        solde_sender: user.solde,
                        frais,
                        type: 'CREDIT_' + operateur.toUpperCase(),
                        senderId: userId,
                        receiverString: telephone,
                    }
                });
                // Mise à jour du solde de l'utilisateur
                const newSolde = user.solde - (montant + frais);
                yield prisma_1.default.user.update({
                    where: { id: userId },
                    data: { solde: newSolde }
                });
                // Simuler le traitement avec l'opérateur
                yield this.processOperatorAPI(transaction);
                // Mise à jour du statut de la transaction
                const updatedTransaction = yield prisma_1.default.transactions.update({
                    where: { id: transaction.id },
                    data: { status: 'completed' }
                });
                return res.status(201).json({
                    success: true,
                    message: 'Achat de crédit effectué avec succès',
                    data: {
                        transaction: updatedTransaction
                    }
                });
            }
            catch (error) {
                console.error('Erreur achat crédit:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Une erreur est survenue lors de l\'achat du crédit'
                });
            }
        });
        this.getCreditPurchaseHistory = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = parseInt(req.params.userId);
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const skip = (page - 1) * limit;
                const [purchases, total] = yield Promise.all([
                    prisma_1.default.transactions.findMany({
                        where: {
                            senderId: userId,
                            type: { startsWith: 'CREDIT_' }
                        },
                        skip,
                        take: limit,
                        orderBy: { date: 'desc' },
                        include: {
                            sender: true
                        }
                    }),
                    prisma_1.default.transactions.count({
                        where: {
                            senderId: userId,
                            type: { startsWith: 'CREDIT_' }
                        }
                    })
                ]);
                return res.status(200).json({
                    success: true,
                    data: {
                        purchases,
                        pagination: {
                            total,
                            pages: Math.ceil(total / limit),
                            currentPage: page,
                            limit
                        }
                    }
                });
            }
            catch (error) {
                console.error('Erreur historique achats:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Une erreur est survenue lors de la récupération de l\'historique'
                });
            }
        });
        this.transactionController = new TransactionController_1.default();
    }
    validatePhoneNumber(telephone, operateur) {
        // Les regex pour les numéros sénégalais selon l'opérateur
        const phoneRegex = {
            orange: /^(?:\+221|221)?0?(77|78)[0-9]{7}$/, // Orange Sénégal: 77 et 78
            expresso: /^(?:\+221|221)?0?(70)[0-9]{7}$/, // Expresso: 70
            free: /^(?:\+221|221)?0?(76)[0-9]{7}$/ // Free: 76
        };
        const regex = phoneRegex[operateur.toLowerCase()];
        return regex.test(telephone.replace(/\s/g, ''));
    }
    processOperatorAPI(transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Simuler un délai d'API
                yield new Promise(resolve => setTimeout(resolve, 1000));
                // Mettre à jour uniquement le statut de la transaction
                yield prisma_1.default.transactions.update({
                    where: { id: transaction.id },
                    data: { status: 'completed' }
                });
            }
            catch (error) {
                console.error('Erreur API opérateur:', error);
                throw new Error('Échec de la communication avec l\'opérateur');
            }
        });
    }
}
exports.creditPurchaseController = new CreditPurchaseController();
