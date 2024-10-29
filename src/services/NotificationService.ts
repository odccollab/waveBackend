import { io } from '../app';
import prisma from '../prisma';

class NotificationService {
  async sendNotification(userId: number, content: string) {
    const notification = await prisma.notifications.create({
      data: {
        message: content,
        userId,
        date: new Date(),
      },
    });

    io.emit(`notification-${userId}`, notification); // Envoie au client spécifique
    return notification;
  }

  // Récupère toutes les notifications pour un utilisateur spécifique
  async getNotifications() {
    try {
      const userId= 1;
      const notifications = await prisma.notifications.findMany();
      return notifications;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw new Error('Could not fetch notifications'); // Ou renvoyez un message d'erreur approprié
    }
  }
}

export default new NotificationService();
