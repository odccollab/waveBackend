import express, {Router} from 'express';
import CompteController from '../controllers/CompteController';

const router:Router = express.Router();

router.post('/deplafon', CompteController.deplafon.bind(CompteController));

export default router;