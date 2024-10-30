"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// TransactionRoute.ts
const express_1 = __importDefault(require("express"));
const TransferController_1 = __importDefault(require("../controllers/TransferController"));
const router = express_1.default.Router();
// Définition de la route pour le transfert d'argent
router.post('/send', TransferController_1.default.transfer);
// GET /transactions : Récupère toutes les transactions de l'utilisateur connecté
router.get('/transactions', TransferController_1.default.getTransactions);
// GET /transactions/:id : Récupère les détails d'une transaction spécifique par son ID
router.get('/transactions/:id', TransferController_1.default.getTransactionById);
// POST /transactions/annuller/:id : Annuler une transaction spécifique par son ID
router.post('/transactions/annuller/:id', TransferController_1.default.cancelTransaction);
exports.default = router;
