import { Router } from 'express';
import UserController2 from '../controllers/UserController2';
import Middleware from "../middlewares/Middleware";
import upload from "../middlewares/multerConfig";
import TransfertDiopController from "../controllers/TransfertDiopController";

const router = Router();

router.post('/retrait-code',Middleware.verifyToken, TransfertDiopController.retrait1);
router.post('/retrait',Middleware.verifyToken,Middleware.verifySessionToken, TransfertDiopController.retrait2);
export default router;
