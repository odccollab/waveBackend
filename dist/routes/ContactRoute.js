"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ContactController_1 = require("../controllers/ContactController");
// import { authenticateUser } from '../middlewares/auth'; // Middleware d'authentification
const router = (0, express_1.Router)();
// Appliquer le middleware d'authentification à toutes les routes
// router.use(authenticateUser);
// Routes pour la gestion des contacts
router.post('/contacts', ContactController_1.contactController.createContact);
router.get('/contacts/user/:userId', ContactController_1.contactController.getContacts);
router.get('/contacts', ContactController_1.contactController.getContacts);
router.get('/contacts/:id', ContactController_1.contactController.getContact);
router.put('/contacts/:id', ContactController_1.contactController.updateContact);
router.delete('/contacts/:id', ContactController_1.contactController.deleteContact);
exports.default = router;
