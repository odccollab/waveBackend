import { Request, Response } from 'express';
import prisma from '../prisma';
import TransactionController from './TransactionController';
class RechargeController {
  private transactionController: TransactionController;

  constructor() {
    this.transactionController = new TransactionController();
  }

  // Recharger le compte Wave depuis un compte bancaire
  // Recharger le compte Wave depuis un compte bancaire
async chargFromBank(req: Request, res: Response) {
  try {
    const { bankAccountId, amount } = req.body;
    const userId = 1; // Remplacez par `req.userId` dans un contexte authentifié

    if (!bankAccountId || !amount || amount <= 0) {
      return res.status(400).json({
        error: 'ID du compte bancaire et montant requis, montant doit être positif',
      });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const bankAccount = await prisma.compteBank.findUnique({
      where: { id: bankAccountId },
    });

    if (!user || !bankAccount || bankAccount.userId !== userId) {
      return res.status(404).json({ error: 'Utilisateur ou compte bancaire introuvable' });
    }

    if (bankAccount.solde < amount) {
      return res.status(400).json({ error: 'Solde insuffisant sur le compte bancaire' });
    }

    // Vérification si la recharge dépasse le plafond de l'utilisateur
    if (user.solde + amount > user.plafond!) {
      return res.status(400).json({
        error: `Le montant dépasse le plafond autorisé de ${user.plafond}`,
      });
    }

    // Effectuer la transaction en décrémentant le solde du compte bancaire
    const transactionResult = await prisma.$transaction(async (prisma) => {
      await prisma.compteBank.update({
        where: { id: bankAccountId },
        data: { solde: { decrement: amount } },
      });

      const result = await this.transactionController.transaction(
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
      const { bankAccountId, amount } = req.body;
      const userId = 1; // Remplacez par `req.userId` dans un contexte authentifié

      if (!bankAccountId || !amount || amount <= 0) {
        return res.status(400).json({
          error: 'ID du compte bancaire et montant requis, montant doit être positif',
        });
      }

      const user = await prisma.user.findUnique({ where: { id: userId } });
      const bankAccount = await prisma.compteBank.findUnique({
        where: { id: bankAccountId },
      });

      if (!user || !bankAccount || bankAccount.userId !== userId) {
        return res.status(404).json({ error: 'Utilisateur ou compte bancaire introuvable' });
      }

      if (user.solde < amount) {
        return res.status(400).json({ error: 'Solde insuffisant sur le compte Wave' });
      }

      // Mise à jour du solde du compte bancaire
      await prisma.compteBank.update({
        where: { id: bankAccountId },
        data: { solde: { increment: amount } },
      });

      // Appel de la méthode transaction du TransactionController
      const transactionResult = await this.transactionController.transaction(
        user,
        amount,
        'from_wave',
        user.telephone // Assurez-vous que c'est le numéro correct pour le receiver
      );

      if (typeof transactionResult === 'string') {
        // Si la méthode retourne une chaîne, cela signifie qu'il y a une erreur
        return res.status(400).json({ error: transactionResult });
      }

      res.status(201).json({ message: 'Compte bancaire rechargé avec succès', transaction: transactionResult });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur lors du rechargement du compte bancaire depuis Wave' });
    }
  }
}

export default new RechargeController();
