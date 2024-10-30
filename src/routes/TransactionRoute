// TransactionRoute.ts
import express, { Router } from 'express';
import TransferController from '../controllers/TransferController';

const router: Router = express.Router();

// Définition de la route pour le transfert d'argent
router.post('/send', TransferController.transfer);

export default router;
