"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// WithdrawalRoutes.ts
const express_1 = require("express");
const TransfertController_1 = require("../controllers/TransfertController");
const router = (0, express_1.Router)();
// Route pour initier un retrait (client)
router.post('/withdrawal/initiate', TransfertController_1.TransfertController.processWithdrawal);
// Route pour traiter un retrait (agent)
router.post('/withdrawal/process', TransfertController_1.TransfertController.processWithdrawal);
// Route pour vérifier le statut
// router.get('/withdrawal/status/:withdrawalCode', TransfertController.checkWithdrawalStatus);
exports.default = router;
