import { Request, Response } from 'express';
import { PrismaClient, User, Transactions } from '@prisma/client';
import prisma from "../prisma";
import { TransactionController } from './TransactionController';

interface CreditPurchaseDto {
    telephone: string;    // Numéro de téléphone à recharger
    montant: number;      // Montant du crédit à acheter
    operateur: string;    // Opérateur téléphonique (Orange, Expresso, Free)
    userId: number;       // ID de l'utilisateur qui fait l'achat
}

class CreditPurchaseController {
    private transactionController: TransactionController;

    constructor() {
        this.transactionController = new TransactionController();
    }

    public purchaseCredit = async (req: Request, res: Response) => {
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
            const user = await prisma.user.findUnique({
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
            const transaction = await prisma.transactions.create({
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
            await prisma.user.update({
                where: { id: userId },
                data: { solde: newSolde }
            });

            // Simuler le traitement avec l'opérateur
            await this.processOperatorAPI(transaction);

            // Mise à jour du statut de la transaction
            const updatedTransaction = await prisma.transactions.update({
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

        } catch (error) {
            console.error('Erreur achat crédit:', error);
            return res.status(500).json({
                success: false,
                message: 'Une erreur est survenue lors de l\'achat du crédit'
            });
        }
    }

    private validatePhoneNumber(telephone: string, operateur: string): boolean {
        // Les regex pour les numéros sénégalais selon l'opérateur
        const phoneRegex = {
            orange: /^(?:\+221|221)?0?(77|78)[0-9]{7}$/,    // Orange Sénégal: 77 et 78
            expresso: /^(?:\+221|221)?0?(70)[0-9]{7}$/,     // Expresso: 70
            free: /^(?:\+221|221)?0?(76)[0-9]{7}$/          // Free: 76
        };

        const regex = phoneRegex[operateur.toLowerCase() as keyof typeof phoneRegex];
        return regex.test(telephone.replace(/\s/g, ''));
    }

    private async processOperatorAPI(transaction: any): Promise<void> {
        try {
            // Simuler un délai d'API
            await new Promise(resolve => setTimeout(resolve, 1000));
    
            // Mettre à jour uniquement le statut de la transaction
            await prisma.transactions.update({
                where: { id: transaction.id },
                data: { status: 'completed' }
            });
    
        } catch (error) {
            console.error('Erreur API opérateur:', error);
            throw new Error('Échec de la communication avec l\'opérateur');
        }
    }

    public getCreditPurchaseHistory = async (req: Request, res: Response) => {
        try {
            const userId = parseInt(req.params.userId);
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const skip = (page - 1) * limit;
    
            const [purchases, total] = await Promise.all([
                prisma.transactions.findMany({
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
                prisma.transactions.count({
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
    
        } catch (error) {
            console.error('Erreur historique achats:', error);
            return res.status(500).json({
                success: false,
                message: 'Une erreur est survenue lors de la récupération de l\'historique'
            });
        }
    }
}

export const creditPurchaseController = new CreditPurchaseController();