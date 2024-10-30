import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class TransactiondameController {
    // Récupérer toutes les transactions de l'utilisateur connecté
    static async getTransactions(req: Request, res: Response): Promise<Response> {
        try {
            const userId = 1;

            const transactions = await prisma.transactions.findMany({
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
        } catch (error) {
            console.error('Erreur lors de la récupération des transactions:', error);
            return res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération des transactions"
            });
        }
    }

    // Récupérer une transaction spécifique par son ID
    static async getTransactionById(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const userId = 1;

            const transaction = await prisma.transactions.findUnique({
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
        } catch (error) {
            console.error('Erreur lors de la récupération de la transaction:', error);
            return res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération de la transaction"
            });
        }
    }

    // Annuler une transaction
    static async cancelTransaction(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const userId = 1;

            const transaction = await prisma.transactions.findUnique({
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
            const updatedTransaction = await prisma.transactions.update({
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
        } catch (error) {
            console.error('Erreur lors de l\'annulation de la transaction:', error);
            return res.status(500).json({
                success: false,
                message: "Erreur lors de l'annulation de la transaction"
            });
        }
    }

    // Méthode utilitaire pour créer une transaction
    // static async createTransaction(sender: User, receiverId: number, amount: number): Promise<any> {
    //     try {
    //         const transaction = await prisma.transactions.create({
    //             data: {
    //                 senderId: sender.id,
    //                 receiverId: receiverId,
    //                 paiement: amount,
    //                 status: 'PENDING',
    //                 date: new Date(),
    //                 solde_sender: sender.solde,
    //                 solde_receiver: 0, // À mettre à jour avec le solde réel du destinataire
    //                 frais: 0, // À calculer selon vos règles
    //                 type: 'TRANSFER', // À ajuster selon vos besoins
    //                 identifiant: `TR${Date.now()}` // Générer un identifiant unique
    //             }
    //         });

    //         return transaction;
    //     } catch (error) {
    //         console.error('Erreur lors de la création de la transaction:', error);
    //         throw error;
    //     }
    // }
}

export default TransactiondameController;
