import { Router } from 'express';
import { contactController } from '../controllers/ContactController';
import upload from "../middlewares/multerConfig";
// import { authenticateUser } from '../middlewares/auth'; // Middleware d'authentification

const router = Router();

// Appliquer le middleware d'authentification à toutes les routes
// router.use(authenticateUser);

// Routes pour la gestion des contacts
router.post('/contacts', contactController.createContact);
router.get('/contacts/user/:userId', contactController.getContacts);
router.get('/contacts', contactController.getContacts);
router.get('/contacts/:id', contactController.getContact);
router.put('/contacts/:id', contactController.updateContact);
router.delete('/contacts/:id', contactController.deleteContact);

export default router;