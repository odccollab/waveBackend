import express, { Router } from 'express';
import NotificationController from '../controllers/NotificationController';

const router: Router = express.Router();

// Route pour supprimer une notification
router.delete('/notifications/:id', NotificationController.deleteNotification);

// Route pour lister les notifications
router.get('/notifications', NotificationController.getNotifications);

export default router;
