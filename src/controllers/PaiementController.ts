import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import NotificationService from '../services/NotificationService';
import TransactionController from './TransactionController';

const prisma = new PrismaClient();

class PaiementController {
    private transactionController: TransactionController;

    constructor() {
        this.transactionController = new TransactionController();
    }

    async payerService(req: Request, res: Response): Promise<void> {
        try {
            const { userId, societeId, montant } = req.body;

            // Vérifications de base
            if (!userId || !societeId || !montant || montant <= 0) {
                res.status(400).json({
                    error: 'User ID, Societe ID, et montant sont requis, et le montant doit être positif',
                });
                return;
            }

            // Récupérer l'utilisateur et vérifier le solde
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (!user) {
                res.status(404).json({ error: "Utilisateur introuvable" });
                return;
            }
            if (user.solde < montant) {
                res.status(400).json({ error: 'Solde insuffisant' });
                return;
            }

            // Récupérer la société
            const societe = await prisma.user.findUnique({ where: { id: societeId } });
            if (!societe || societe.type !== 'societe') {
                res.status(404).json({ error: "Société introuvable" });
                return;
            }

            // Effectuer le paiement dans une transaction
            const transaction = await prisma.$transaction(async (txPrisma) => {
                
                return await TransactionController.transaction(user, montant, 'paiement', societe.telephone);
            });
            
            // Envoyer la notification après un paiement réussi
            await NotificationService.sendNotification(userId, `Vous avez payé ${montant} à la société ${societeId}.`);
            
            res.status(201).json({
                message: 'Paiement effectué avec succès',
                transaction,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erreur lors du paiement du service' });
        }
    }
}

export default new PaiementController();
