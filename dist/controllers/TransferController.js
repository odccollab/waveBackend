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
const TransactionController_1 = __importDefault(require("./TransactionController"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class TransferController {
    transfer(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { receiverId, montant } = req.body;
            try {
                // Validation des entrées
                if (!receiverId || !montant || isNaN(receiverId) || isNaN(montant)) {
                    return res.status(400).json({
                        error: 'Invalid input: receiverId and montant are required and must be numbers'
                    });
                }
                // Convertir montant en nombre
                const montantNumber = Number(montant);
                // Fixer senderId à 1 comme demandé
                const senderId = 1;
                // Récupérer les utilisateurs avec une transaction Prisma pour garantir la cohérence
                const [sender, receiver] = yield Promise.all([
                    prisma.user.findUnique({
                        where: { id: senderId }
                    }),
                    prisma.user.findUnique({
                        where: { id: receiverId }
                    })
                ]);
                // Vérifier l'existence des utilisateurs
                if (!sender) {
                    return res.status(404).json({ error: 'Sender not found' });
                }
                if (!receiver) {
                    return res.status(404).json({ error: 'Receiver not found' });
                }
                // Vérifier que le receiver a un numéro de téléphone
                if (!receiver.telephone) {
                    return res.status(400).json({
                        error: 'Receiver must have a valid phone number'
                    });
                }
                // Type est toujours "transfert"
                const type = 'transfert';
                // Commencer une transaction Prisma pour garantir l'atomicité
                const transactionResult = yield prisma.$transaction((prismaClient) => __awaiter(this, void 0, void 0, function* () {
                    // Mettre à jour le solde du sender
                    const updatedSender = yield prismaClient.user.update({
                        where: { id: senderId },
                        data: {
                            solde: {
                                decrement: montantNumber
                            }
                        }
                    });
                    // Appeler la méthode transaction avec le sender mis à jour
                    const result = yield TransactionController_1.default.transaction(updatedSender, montantNumber, type, receiver.telephone);
                    return result;
                }));
                // Gérer le résultat
                if (typeof transactionResult === 'string') {
                    return res.status(400).json({ error: transactionResult });
                }
                // Retourner la transaction créée
                return res.status(201).json(transactionResult);
            }
            catch (error) {
                console.error('Error in transfer:', error);
                // Gérer les erreurs Prisma spécifiquement
                if (error instanceof Error && error.name === 'PrismaClientValidationError') {
                    return res.status(400).json({
                        error: 'Validation error: Please check your input data'
                    });
                }
                return res.status(500).json({ error: 'Internal server error' });
            }
        });
    }
}
exports.default = new TransferController();
