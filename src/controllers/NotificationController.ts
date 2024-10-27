import { Request, Response } from 'express';
import { PrismaClient, Notifications } from '@prisma/client';

const prisma = new PrismaClient();

class NotificationController {
    async getNotifications(req: Request, res: Response) {
        try {
            // Pour l'instant, on utilise un userId fixe à 1
            // Dans un cas réel, vous récupéreriez l'userId depuis le token d'authentification
            const userId = 2;

            const notifications = await prisma.notifications.findMany({
                where: {
                    userId: userId
                },
                orderBy: {
                    date: 'desc'  // Les plus récentes d'abord
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

            return res.status(200).json(notifications);

        } catch (error) {
            console.error('Error fetching notifications:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    async deleteNotification(req: Request, res: Response) {
        try {
            const notificationId = parseInt(req.params.id);

            // Vérifier si l'ID est un nombre valide
            if (isNaN(notificationId)) {
                return res.status(400).json({ error: 'Invalid notification ID' });
            }

            // Pour l'instant, on utilise un userId fixe à 1
            const userId = 1;

            // Vérifier si la notification existe et appartient à l'utilisateur
            const notification = await prisma.notifications.findFirst({
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
            await prisma.notifications.delete({
                where: {
                    id: notificationId
                }
            });

            return res.status(200).json({ 
                message: 'Notification deleted successfully' 
            });

        } catch (error) {
            console.error('Error deleting notification:', error);
            
            if (error instanceof Error && error.name === 'PrismaClientValidationError') {
                return res.status(400).json({ 
                    error: 'Validation error: Please check your input data' 
                });
            }

            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}

export default new NotificationController();