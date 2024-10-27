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
}

export default new NotificationService();
