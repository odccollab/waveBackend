import express, { Router } from 'express';
import RechargeController from '../controllers/RechargeController';

const  router:Router = express.Router();;

router.post('/charg-from-bank', RechargeController.chargFromBank.bind(RechargeController));
router.post('/charg-from-wave', RechargeController.chargFromWave.bind(RechargeController));

export default router;
