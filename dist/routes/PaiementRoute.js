"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const PaiementController_1 = __importDefault(require("../controllers/PaiementController"));
const router = express_1.default.Router();
// Lier la méthode payerService à l'instance de PaiementController
router.post('/service', PaiementController_1.default.payerService.bind(PaiementController_1.default));
exports.default = router;
