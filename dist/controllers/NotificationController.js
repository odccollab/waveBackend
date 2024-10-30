"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class NotificationController {
    getNotifications(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Pour l'instant, on utilise un userId fixe à 1
                // Dans un cas réel, vous récupéreriez l'userId depuis le token d'authentification
                const userId = 1;
                const notifications = yield prisma.notifications.findMany({
                    where: {
                        userId: userId
                    },
                    orderBy: {
                        date: 'desc' // Les plus récentes d'abord
                    },
                    select: {
                        id: true,
                        message: true,
                        read_at: true,
                        readed: true,
                        date: true,
                        userId: true
                    }
                });
                // Par défaut, on prend les 2 premières notifications
                const notificationsToDisplay = notifications.slice(0, 2);
                return res.status(200).json(notificationsToDisplay);
            }
            catch (error) {
                console.error('Error fetching notifications:', error);
                return res.status(500).json({ error: 'Internal server error' });
            }
        });
    }
    deleteNotification(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const notificationId = parseInt(req.params.id);
                // Vérifier si l'ID est un nombre valide
                if (isNaN(notificationId)) {
                    return res.status(400).json({ error: 'Invalid notification ID' });
                }
                // Pour l'instant, on utilise un userId fixe à 1
                const userId = 1;
                // Vérifier si la notification existe et appartient à l'utilisateur
                const notification = yield prisma.notifications.findFirst({
                    where: {
                        id: notificationId,
                        userId: userId
                    }
                });
                if (!notification) {
                    return res.status(404).json({
                        error: 'Notification not found or does not belong to the user'
                    });
                }
                // Supprimer la notification
                yield prisma.notifications.delete({
                    where: {
                        id: notificationId
                    }
                });
                return res.status(200).json({
                    message: 'Notification deleted successfully'
                });
            }
            catch (error) {
                console.error('Error deleting notification:', error);
                if (error instanceof Error && error.name === 'PrismaClientValidationError') {
                    return res.status(400).json({
                        error: 'Validation error: Please check your input data'
                    });
                }
                return res.status(500).json({ error: 'Internal server error' });
            }
        });
    }
}
exports.default = new NotificationController();
