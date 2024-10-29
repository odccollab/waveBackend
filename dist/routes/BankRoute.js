"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const BankController_1 = __importDefault(require("../controllers/BankController"));
const multerConfig_1 = __importDefault(require("../middlewares/multerConfig"));
const router = express_1.default.Router();
// Route pour créer une banque avec upload de l'image
router.post('/create', multerConfig_1.default.single('photo'), BankController_1.default.createBank);
// Route pour récupérer toutes les banques
router.get('/alls', BankController_1.default.getAllBanks);
exports.default = router;
