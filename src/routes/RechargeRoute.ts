import express, { Router } from 'express';
import RechargeController from '../controllers/RechargeController';
import NotificationService from '../services/NotificationService';
import Middleware from '../middlewares/Middleware';
const  router:Router = express.Router();;

router.post('/charg-from-bank',Middleware.verifyToken,Middleware.verifySessionToken, RechargeController.chargFromBank.bind(RechargeController));
router.post('/charg-from-wave', RechargeController.chargFromWave.bind(RechargeController));
 router.get('/notifications',Middleware.verifyToken,Middleware.verifySessionToken,  RechargeController.getTransactions.bind(RechargeController));
//  router.get('/notifications',NotificationService.getNotifications);


export default router;
