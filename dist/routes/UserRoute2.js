"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UserController2_1 = __importDefault(require("../controllers/UserController2"));
const Middleware_1 = __importDefault(require("../middlewares/Middleware"));
const multerConfig_1 = __importDefault(require("../middlewares/multerConfig"));
const router = (0, express_1.Router)();
router.post('/request-otp', UserController2_1.default.requestOtp);
router.post('/verify-otp', UserController2_1.default.verifyOtp);
router.post('/verify-pin', Middleware_1.default.verifyToken, UserController2_1.default.verifyPin);
router.post('/create', multerConfig_1.default.fields([{ name: 'infosImages', maxCount: 2 }, { name: 'photo' }]), // Gère le champ `contenuMedia`
(req, res, next) => {
    console.log(req.files); // Vérifie la présence de fichiers dans `contenuMedia`
    next();
}, Middleware_1.default.dynamicUploadMiddleware, // Middleware pour gérer l'upload dynamique
UserController2_1.default.createUser // Contrôleur pour créer l'utilisateur
);
router.get('/client', Middleware_1.default.verifyToken, Middleware_1.default.verifySessionToken, UserController2_1.default.getSimpleUsers);
router.get('/societe', Middleware_1.default.verifyToken, Middleware_1.default.verifySessionToken, UserController2_1.default.getEntrepriseUsers);
exports.default = router;
