import { Request, Response } from 'express';
import TransactionController from './TransactionController';
import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

class TransferController {
    async transfer(req: Request, res: Response) {
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
            const [sender, receiver] = await Promise.all([
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
            const transactionResult = await prisma.$transaction(async (prismaClient) => {
                // Mettre à jour le solde du sender
                const updatedSender = await prismaClient.user.update({
                    where: { id: senderId },
                    data: { 
                        solde: {
                            decrement: montantNumber
                        }
                    }
                });

                // Appeler la méthode transaction avec le sender mis à jour
                const result = await TransactionController.transaction(
                    updatedSender,
                    montantNumber,
                    type,
                    receiver.telephone
                );

                return result;
            });

            // Gérer le résultat
            if (typeof transactionResult === 'string') {
                return res.status(400).json({ error: transactionResult });
            }

            // Retourner la transaction créée
            return res.status(201).json(transactionResult);

        } catch (error) {
            console.error('Error in transfer:', error);
            
            // Gérer les erreurs Prisma spécifiquement
            if (error instanceof Error && error.name === 'PrismaClientValidationError') {
                return res.status(400).json({ 
                    error: 'Validation error: Please check your input data' 
                });
            }

            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}

export default new TransferController();