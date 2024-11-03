"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const RechargeController_1 = __importDefault(require("../controllers/RechargeController"));
const Middleware_1 = __importDefault(require("../middlewares/Middleware"));
const router = express_1.default.Router();
;
router.post('/charg-from-bank', Middleware_1.default.verifyToken, Middleware_1.default.verifySessionToken, RechargeController_1.default.chargFromBank.bind(RechargeController_1.default));
router.post('/charg-from-wave', RechargeController_1.default.chargFromWave.bind(RechargeController_1.default));
router.get('/notifications', Middleware_1.default.verifyToken, Middleware_1.default.verifySessionToken, RechargeController_1.default.getTransactions.bind(RechargeController_1.default));
//  router.get('/notifications',NotificationService.getNotifications);
exports.default = router;
