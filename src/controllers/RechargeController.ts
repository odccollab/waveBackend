import { Request, Response } from 'express';
import prisma from '../prisma';
import TransactionController from './TransactionController';
import { log } from 'console';

class RechargeController {
  private transactionController: TransactionController;

  constructor() {
    this.transactionController = new TransactionController();
  }

  
  
 // Recharger le compte Wave depuis le compte bancaire
async chargFromBank(req: Request, res: Response) {
  try {
    const { userBankId, amount } = req.body;
    const userId = req.user?.id ? parseInt(req.user.id as string, 10) : null;

    if (!userId) {
      return res.status(400).json({ error: 'Utilisateur non authentifié.' });
    }

    if (!userBankId || !amount || amount <= 0) {
      return res.status(400).json({
        error: 'ID du compte bancaire et montant requis, le montant doit être positif.',
      });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur introuvable.' });
    }

    const userBank = await prisma.userBank.findUnique({
      where: { userId_bankId: { userId, bankId: userBankId } },
    });

    if (!userBank) {
      return res.status(404).json({ error: 'Compte bancaire introuvable pour cet utilisateur.' });
    }

    if (userBank.solde < amount) {
      return res.status(400).json({ error: 'Solde insuffisant sur le compte bancaire.' });
    }

    if (user.solde + amount > user.plafond!) {
      return res.status(400).json({
        error: `Le montant dépasse le plafond autorisé de ${user.plafond}`,
      });
    }

    const transactionResult = await prisma.$transaction(async (prisma) => {
      await prisma.userBank.update({
        where: { userId_bankId: { userId, bankId: userBankId } },
        data: { solde: { decrement: amount } },
      });

      const result = await TransactionController.transaction(
        user,
        amount,
        'from_bank',
        user.telephone
      );

      if (typeof result === 'string') {
        throw new Error(result);
      }

      return result;
    });

    res.status(201).json({
      message: 'Compte Wave rechargé avec succès',
      transaction: transactionResult,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Erreur lors du rechargement du compte Wave depuis la banque',
    });
  }
}

// Recharger le compte bancaire depuis le compte Wave
async chargFromWave(req: Request, res: Response) {
  try {
    const { userBankId, amount } = req.body;
    const userId = req.user?.id ? parseInt(req.user.id as string, 10) : null;

    if (!userId) {
      return res.status(400).json({ error: 'Utilisateur non authentifié.' });
    }

    if (!userBankId || !amount || amount <= 0) {
      return res.status(400).json({
        error: 'ID du compte bancaire et montant requis, montant doit être positif',
      });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur introuvable.' });
    }

    const userBank = await prisma.userBank.findUnique({
      where: { userId_bankId: { userId, bankId: userBankId } },
    });

    if (!userBank) {
      return res.status(404).json({ error: 'Compte bancaire introuvable pour cet utilisateur.' });
    }

    if (user.solde < amount) {
      return res.status(400).json({ error: 'Solde insuffisant sur le compte Wave' });
    }

    await prisma.userBank.update({
      where: { userId_bankId: { userId, bankId: userBankId } },
      data: { solde: { increment: amount } },
    });

    const transactionResult = await TransactionController.transaction(
      user,
      amount,
      'from_wave',
      user.telephone
    );

    if (typeof transactionResult === 'string') {
      return res.status(400).json({ error: transactionResult });
    }

    res.status(201).json({ message: 'Compte bancaire rechargé avec succès', transaction: transactionResult });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors du rechargement du compte bancaire depuis Wave' });
  }
}


  // Récupérer toutes les transactions de l'utilisateur connecté
  async getTransactions(req: Request, res: Response): Promise<Response> {
    const userId = parseInt(req.user!.id); // Remplacez par `req.userId` dans un contexte authentifié
    console.log(userId);
    try {
      const transactions = await prisma.transactions.findMany({
        where: {
          OR: [
            { senderId: userId },
            { receiverId: userId }
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
        data:null,
        message: "Erreur lors de la récupération des transactions"
      });
    }
  }
}

export default new RechargeController();
