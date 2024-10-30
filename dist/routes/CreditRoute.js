"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const CreditPurchaseController_1 = require("../controllers/CreditPurchaseController");
// import { authenticateUser } from '../middlewares/auth'; // Middleware d'authentification
const router = (0, express_1.Router)();
router.post('/credit/purchase', CreditPurchaseController_1.creditPurchaseController.purchaseCredit);
router.get('/credit/history/:userId', CreditPurchaseController_1.creditPurchaseController.getCreditPurchaseHistory);
exports.default = router;
