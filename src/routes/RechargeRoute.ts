import express, { Router } from 'express';
import RechargeController from '../controllers/RechargeController';
import NotificationService from '../services/NotificationService';
const  router:Router = express.Router();;

router.post('/charg-from-bank', RechargeController.chargFromBank.bind(RechargeController));
router.post('/charg-from-wave', RechargeController.chargFromWave.bind(RechargeController));
 router.get('/notifications', RechargeController.getTransactions.bind(RechargeController));
//  router.get('/notifications',NotificationService.getNotifications);


export default router;
