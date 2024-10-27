import express, { Router } from 'express';
import PaiementController from '../controllers/PaiementController';

const router: Router = express.Router();

// Lier la méthode payerService à l'instance de PaiementController
router.post('/service', PaiementController.payerService.bind(PaiementController));

export default router;
