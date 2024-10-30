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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOtp = void 0;
const redisClient_1 = __importDefault(require("../redisClient"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../prisma"));
const MailerService_1 = __importDefault(require("../utils/MailerService"));
const SmsService_1 = __importDefault(require("../utils/SmsService"));
// Générer un OTP à 6 chiffres
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();
exports.generateOtp = generateOtp;
class UserController2 {
    static requestOtp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { phoneNumber } = req.body;
            console.log(phoneNumber);
            // Vérifier si l'utilisateur existe
            const user = yield prisma_1.default.user.findFirst({
                where: {
                    telephone: phoneNumber,
                }
            });
            console.log(user);
            if (!user) {
                return res.status(404).json({ message: 'Utilisateur non trouvé.' });
            }
            // Générer un OTP et le stocker dans Redis avec une expiration (5 minutes)
            const otp = (0, exports.generateOtp)();
            yield redisClient_1.default.set(`otp_${phoneNumber}`, otp, { EX: 300 });
            yield MailerService_1.default.sendEmail(user.mail, "Authentification", "voici votre code : " + otp);
            yield SmsService_1.default.sendSms(user.telephone, "voici votre code : " + otp);
            // Log ou envoi du code OTP (SMS)
            console.log(`Code OTP pour ${phoneNumber} : ${otp}`);
            return res.status(200).json({ message: 'Code OTP envoyé.' });
        });
    }
    static verifyOtp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { phoneNumber, otp } = req.body;
            // Récupérer l’OTP depuis Redis
            const storedOtp = yield redisClient_1.default.get(`otp_${phoneNumber}`);
            console.log("ddddd", storedOtp);
            if (storedOtp !== otp) {
                return res.status(401).json({ message: 'OTP incorrect ou expiré.' });
            }
            yield redisClient_1.default.del(`otp_${phoneNumber}`);
            const user = yield prisma_1.default.user.findFirst({
                where: {
                    telephone: phoneNumber,
                }
            });
            let secret = process.env.SECRET_KEY;
            const token = jsonwebtoken_1.default.sign({ userId: user.id, telephone: user.telephone }, secret, {
                expiresIn: '30d',
            });
            return res.status(200).json({ message: 'OTP vérifié.', token });
        });
    }
    static verifyPin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { pin } = req.body;
            console.log(req.body);
            const telephone = (_a = req.user) === null || _a === void 0 ? void 0 : _a.telephone; // Utiliser les informations de req.user
            const user = yield prisma_1.default.user.findFirst({
                where: { telephone }
            });
            if (!user) {
                return res.status(404).json({ message: 'Utilisateur non trouvé.' });
            }
            console.log(user);
            // Vérification du code PIN
            if (user.codeSecret != pin) {
                return res.status(401).json({ message: 'Code PIN incorrect.' });
            }
            // Création d'un sessionToken pour la session utilisateur
            const sessionToken = jsonwebtoken_1.default.sign({ userId: user.id, sessionId: new Date().getTime() }, // Identifiant de session unique
            process.env.SECRET_KEY, { expiresIn: '5m' });
            return res.status(200).json({
                message: 'Connexion réussie.',
                sessionToken: sessionToken
            });
        });
    }
    static createUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nom, prenom, mail, telephone, codeSecret, type } = req.body;
            let { infosImages, photo } = req.body.urls || {}; // URLs des images recto-verso
            photo = photo[0];
            // Vérifier que le type est valide
            const validTypes = ['simple', 'agent', 'marchand', 'entreprise'];
            if (!validTypes.includes(type)) {
                return res.status(400).json({ message: "Type de compte invalide." });
            }
            try {
                // Vérifier si l'utilisateur existe déjà
                const existingUser = yield prisma_1.default.user.findFirst({
                    where: {
                        OR: [
                            { mail },
                            { telephone },
                        ],
                    },
                });
                if (existingUser) {
                    return res.status(400).json({ message: "L'utilisateur existe déjà." });
                }
                // Initialisation des valeurs par défaut pour solde et plafond
                const soldeInitial = 0.0;
                const plafondInitial = type === 'marchand' || type === 'entreprise' ? 10000.0 : 5000.0;
                // Créer l'utilisateur dans la base de données
                const newUser = yield prisma_1.default.user.create({
                    data: {
                        nom,
                        prenom,
                        mail,
                        telephone,
                        codeSecret,
                        type,
                        solde: soldeInitial,
                        plafond: plafondInitial,
                        photo,
                        identifiant: `${prenom} ${telephone}`
                    },
                });
                // Ajouter les URLs des images de la carte d'identité (recto, verso) à `ContenuMedia`
                if (infosImages && Array.isArray(infosImages)) {
                    yield prisma_1.default.contenuMedia.createMany({
                        data: infosImages.map((url) => ({
                            url,
                            userId: newUser.id,
                        })),
                    });
                }
                return res.status(201).json({ message: "Utilisateur créé avec succès.", user: newUser });
            }
            catch (error) {
                console.error("Erreur lors de la création de l'utilisateur:", error);
                return res.status(500).json({ message: "Erreur lors de la création de l'utilisateur." });
            }
        });
    }
}
exports.default = UserController2;
