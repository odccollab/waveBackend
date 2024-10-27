"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const NotificationController_1 = __importDefault(require("../controllers/NotificationController"));
const router = express_1.default.Router();
// Route pour supprimer une notification
router.delete('/notifications/:id', NotificationController_1.default.deleteNotification);
// Route pour lister les notifications
router.get('/notifications', NotificationController_1.default.getNotifications);
exports.default = router;
