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
exports.TransactionController = void 0;
const prisma_1 = __importDefault(require("../prisma"));
class TransactionController {
    transaction(sender, montant, type, receiverPhone) {
        return __awaiter(this, void 0, void 0, function* () {
            // Recherche du receiver par numéro de téléphone dans les utilisateurs
            let receiver = yield prisma_1.default.user.findUnique({
                where: { telephone: receiverPhone },
            });
            // Si le receiver n'est pas un utilisateur, on cherche parmi les contacts du sender
            if (!receiver) {
                receiver = yield prisma_1.default.contact.findFirst({
                    where: { telephone: receiverPhone, userId: sender.id },
                });
            }
            // Si le receiver est introuvable et que la transaction n'est pas un "credit", on retourne une erreur
            if (!receiver && type !== 'credit') {
                return 'Receiver not found in users or contacts';
            }
            // Vérification du solde du sender pour s'assurer qu'il peut couvrir le montant
            if (sender.solde < montant) {
                return 'Insufficient funds';
            }
            let frais = 0;
            let soldeSenderAfterTransaction = sender.solde - montant;
            // Logique de transaction selon le type
            switch (type) {
                case 'paiement':
                    frais = 0;
                    break;
                case 'credit':
                    frais = 0;
                    // Le receiver peut être un contact ou un utilisateur. On ne modifie pas son solde
                    break;
                case 'transfert':
                    // Vérifier que le receiver est un utilisateur avec un solde pour les transferts
                    if (receiver && 'solde' in receiver) {
                        receiver.solde += montant;
                    }
                    else {
                        return 'Receiver must be a user for transfer transactions';
                    }
                    frais = 0;
                    break;
                case 'retrait':
                    // Le receiver doit être un utilisateur de type "pro" pour les retraits
                    if (receiver && 'solde' in receiver && receiver.type === 'pro') {
                        receiver.solde -= montant;
                        sender.solde += montant; // Ajout du montant retiré au solde du sender
                    }
                    else {
                        return 'Receiver must be a professional user for withdrawal transactions';
                    }
                    frais = 0;
                    break;
                case 'depot':
                    // Vérifier que le sender est un professionnel et que le receiver existe et est un utilisateur
                    if (sender.type !== 'pro') {
                        return 'Only professional users can perform a deposit';
                    }
                    if (receiver && 'solde' in receiver) {
                        receiver.solde += montant;
                    }
                    else {
                        return 'Receiver must be an existing user for deposit transactions';
                    }
                    frais = 0;
                    break;
                default:
                    return 'Transaction type not supported';
            }
            // Mettre à jour le solde du sender
            sender.solde = soldeSenderAfterTransaction;
            // Créer l'objet transaction
            const transaction = yield prisma_1.default.transactions.create({
                data: {
                    montant,
                    status: 'completed',
                    date: new Date(),
                    solde_sender: soldeSenderAfterTransaction,
                    solde_receiver: receiver && 'solde' in receiver ? receiver.solde : undefined,
                    frais,
                    type,
                    senderId: sender.id,
                    receiverId: receiver && 'solde' in receiver ? receiver.id : undefined,
                    receiverString: receiver && !('solde' in receiver) ? receiver.telephone : undefined,
                },
            });
            // Mettre à jour les soldes dans la base de données pour le sender et, si applicable, pour le receiver
            yield prisma_1.default.user.update({
                where: { id: sender.id },
                data: { solde: sender.solde },
            });
            if (receiver && 'solde' in receiver) {
                yield prisma_1.default.user.update({
                    where: { id: receiver.id },
                    data: { solde: receiver.solde },
                });
            }
            return transaction;
        });
    }
}
exports.TransactionController = TransactionController;
