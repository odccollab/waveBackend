import express from 'express';
import TransactionController from '../controllers/TransactionController';
// import { authenticateUser } from '../middleware/auth';

const router = express.Router();

// Middleware d'authentification pour toutes les routes
// router.use(authenticateUser);

// GET /transactions : Récupère toutes les transactions de l'utilisateur connecté
router.get('/transactions', TransactionController.getTransactions);

// GET /transactions/:id : Récupère les détails d'une transaction spécifique par son ID
router.get('/transactions/:id', TransactionController.getTransactionById);

// POST /transactions/annuller/:id : Annuler une transaction spécifique par son ID
router.post('/transactions/annuller/:id', TransactionController.cancelTransaction);

export default router;
