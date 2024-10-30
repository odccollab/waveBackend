import express, { Router } from 'express';
import PaiementController from '../controllers/PaiementController';
import Middleware from '../middlewares/Middleware';
const router: Router = express.Router();

// Lier la méthode payerService à l'instance de PaiementController
router.post('/service',Middleware.verifyToken,Middleware.verifySessionToken, PaiementController.payerService.bind(PaiementController));

export default router;
