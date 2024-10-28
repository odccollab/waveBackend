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
}

export default new TransferController();