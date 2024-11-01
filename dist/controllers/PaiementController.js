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
const client_1 = require("@prisma/client");
const NotificationService_1 = __importDefault(require("../services/NotificationService"));
const TransactionController_1 = __importDefault(require("./TransactionController"));
const prisma = new client_1.PrismaClient();
class PaiementController {
    constructor() {
        this.transactionController = new TransactionController_1.default();
    }
    payerService(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            // Vérifiez que l'ID utilisateur est défini et convertissez-le en nombre
            const userId = req.user && parseInt(req.user.id, 10);
            console.log(req.user);
            if (!userId || isNaN(userId)) {
                res.status(400).json({ error: 'ID utilisateur non valide' });
                return;
            }
            console.log(`User ID: ${userId}`);
            try {
                const { societeId, montant } = req.body;
                // Convertissez `societeId` en nombre et vérifiez `montant`
                const parsedSocieteId = parseInt(societeId, 10);
                if (!parsedSocieteId || isNaN(parsedSocieteId) || !montant || montant <= 0) {
                    res.status(400).json({
                        error: 'Societe ID et montant sont requis, et le montant doit être positif',
                    });
                    return;
                }
                console.log(`Societe ID: ${parsedSocieteId}`);
                console.log(`Montant: ${montant}`);
                // Récupérer l'utilisateur et vérifier le solde
                const user = yield prisma.user.findUnique({ where: { id: userId } });
                if (!user) {
                    res.status(404).json({ error: "Utilisateur introuvable" });
                    return;
                }
                if (user.solde < montant) {
                    res.status(400).json({ error: 'Solde insuffisant' });
                    return;
                }
                // Récupérer la société
                const societe = yield prisma.user.findUnique({ where: { id: parsedSocieteId } });
                if (!societe || societe.type !== 'societe') {
                    res.status(404).json({ error: "Société introuvable" });
                    return;
                }
                // Effectuer le paiement dans une transaction
                const transaction = yield prisma.$transaction((txPrisma) => __awaiter(this, void 0, void 0, function* () {
                    return yield TransactionController_1.default.transaction(user, montant, 'paiement', societe.telephone);
                }));
                // Envoyer la notification après un paiement réussi
                yield NotificationService_1.default.sendNotification(userId, `Vous avez payé ${montant} à la société ${societeId}.`);
                res.status(201).json({
                    message: 'Paiement effectué avec succès',
                    transaction,
                });
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Erreur lors du paiement du service' });
            }
        });
    }
}
exports.default = new PaiementController();
