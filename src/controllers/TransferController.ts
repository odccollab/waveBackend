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

      const montantNumber = Number(montant);
      const senderId = 1;
      
      // Calcul des frais (1%)
      const frais = montantNumber * 0.01;
      const montantFinal = montantNumber - frais;

      // Récupérer les utilisateurs AVANT la transaction
      const [sender, receiver] = await Promise.all([
        prisma.user.findUnique({ where: { id: senderId } }),
        prisma.user.findUnique({ where: { id: receiverId } })
      ]);

      // Vérifications
      if (!sender) {
        return res.status(404).json({ error: 'Sender not found' });
      }
      if (!receiver) {
        return res.status(404).json({ error: 'Receiver not found' });
      }
      if (!receiver.telephone) {
        return res.status(400).json({ error: 'Receiver must have a valid phone number' });
      }

      // 1. Créer la transaction (qui gère la décrémentation du solde du sender)
      const transactionResult = await TransactionController.transaction(
        sender,
        montantNumber,
        'transfert',
        receiver.telephone
      );

      // 2. Mettre à jour uniquement le solde du receiver avec le montant moins les frais
      const updatedReceiver = await prisma.user.update({
        where: { id: receiverId },
        data: { 
          solde: { increment: montantFinal }
        }
      });

      return res.status(201).json({
        transaction: transactionResult,
        receiver: updatedReceiver,
        details: {
          montantEnvoye: montantNumber,
          frais: frais,
          montantRecu: montantFinal
        }
      });

    } catch (error) {
      console.error('Error in transfer:', error);
      
      if (error instanceof Error) {
        if (error.name === 'PrismaClientValidationError') {
          return res.status(400).json({ 
            error: 'Validation error: Please check your input data' 
          });
        }
        return res.status(400).json({ error: error.message });
      }
      
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
   async getTransactions(req: Request, res: Response): Promise<Response> {
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
   async getTransactionById(req: Request, res: Response): Promise<Response> {
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
   async cancelTransaction(req: Request, res: Response): Promise<Response> {
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
}

export default new TransferController();
