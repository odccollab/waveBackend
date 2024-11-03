import { Router } from 'express';
import UserController2 from '../controllers/UserController2';
import Middleware from "../middlewares/Middleware";
import upload from "../middlewares/multerConfig";

const router = Router();

router.post('/request-otp', UserController2.requestOtp);
router.post('/verify-otp', UserController2.verifyOtp);
router.post('/verify-pin',Middleware.verifyToken, UserController2.verifyPin);


router.post(
    '/create',
    upload.fields([{ name: 'infosImages', maxCount: 2 },{name:'photo'}]), // Gère le champ `contenuMedia`
    (req, res, next) => {
        console.log(req.files); // Vérifie la présence de fichiers dans `contenuMedia`
        next();
    },
    Middleware.dynamicUploadMiddleware, // Middleware pour gérer l'upload dynamique
    UserController2.createUser // Contrôleur pour créer l'utilisateur
);

router.get('/client',UserController2.getSimpleUsers );
router.get('/societe', UserController2.getEntrepriseUsers );
router.get('/connected',Middleware.verifyToken,Middleware.verifySessionToken, UserController2.getConnectedUser );

export default router;
