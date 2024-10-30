

import { Router } from 'express';
import { creditPurchaseController } from '../controllers/CreditPurchaseController';
// import { authenticateUser } from '../middlewares/auth'; // Middleware d'authentification

const router = Router();



router.post('/credit/purchase', creditPurchaseController.purchaseCredit);
router.get('/credit/history/:userId', creditPurchaseController.getCreditPurchaseHistory);

export default router;