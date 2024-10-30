// TransactionRoute.ts
import express, { Router } from 'express';
import TransferController from '../controllers/TransferController';

const router: Router = express.Router();

// Définition de la route pour le transfert d'argent
router.post('/send', TransferController.transfer);
// GET /transactions : Récupère toutes les transactions de l'utilisateur connecté
router.get('/transactions', TransferController.getTransactions);

// GET /transactions/:id : Récupère les détails d'une transaction spécifique par son ID
router.get('/transactions/:id', TransferController.getTransactionById);

// POST /transactions/annuller/:id : Annuler une transaction spécifique par son ID
router.post('/transactions/annuller/:id', TransferController.cancelTransaction);
export default router;
