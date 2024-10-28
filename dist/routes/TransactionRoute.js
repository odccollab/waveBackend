"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const TransactionController_1 = __importDefault(require("../controllers/TransactionController"));
// import { authenticateUser } from '../middleware/auth';
const router = express_1.default.Router();
// Middleware d'authentification pour toutes les routes
// router.use(authenticateUser);
// GET /transactions : Récupère toutes les transactions de l'utilisateur connecté
router.get('/transactions', TransactionController_1.default.getTransactions);
// GET /transactions/:id : Récupère les détails d'une transaction spécifique par son ID
router.get('/transactions/:id', TransactionController_1.default.getTransactionById);
// POST /transactions/annuller/:id : Annuler une transaction spécifique par son ID
router.post('/transactions/annuller/:id', TransactionController_1.default.cancelTransaction);
exports.default = router;
