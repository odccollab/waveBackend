import express from 'express';
import BankController from '../controllers/BankController';
 import upload from "../middlewares/multerConfig";
 import multer from "multer";

const router = express.Router();

// Route pour créer une banque avec upload de l'image
router.post('/create', upload.single('photo'), BankController.createBank);

// Route pour récupérer toutes les banques
router.get('/alls', BankController.getAllBanks);

export default router;
