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
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();
exports.generateOtp = generateOtp;
// interface CustomRequest extends Request {
//     user?: { id: number; telephone: string; nom: string; prenom: string; image: string; type: string };
// }
class UserController2 {
    static requestOtp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { phoneNumber } = req.body;
            // Vérifier si l'utilisateur existe
            const user = yield prisma_1.default.user.findFirst({
                where: { telephone: phoneNumber },
            });
            if (!user) {
                return res.status(404).json({ message: 'Utilisateur non trouvé.' });
            }
            // Générer un OTP et le stocker dans Redis avec une expiration (5 minutes)
            const otp = (0, exports.generateOtp)();
            yield redisClient_1.default.set(`otp_${phoneNumber}`, otp, { EX: 300 });
            yield MailerService_1.default.sendEmail(user.mail, "Authentification", `Voici votre code : ${otp}`);
            // await smsService.sendSms(user.telephone, `Voici votre code : ${otp}`);
            console.log(`Code OTP pour ${phoneNumber} : ${otp}`);
            return res.status(200).json({ message: 'Code OTP envoyé.', data: otp });
        });
    }
    static verifyOtp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { phoneNumber, otp } = req.body;
            // Récupérer l’OTP depuis Redis
            const storedOtp = yield redisClient_1.default.get(`otp_${phoneNumber}`);
            if (storedOtp !== otp) {
                return res.status(401).json({ message: 'OTP incorrect ou expiré.' });
            }
            yield redisClient_1.default.del(`otp_${phoneNumber}`);
            const user = yield prisma_1.default.user.findFirst({
                where: { telephone: phoneNumber },
            });
            if (!user) {
                return res.status(404).json({ message: 'Utilisateur non trouvé.' });
            }
            const secret = process.env.SECRET_KEY;
            const token = jsonwebtoken_1.default.sign({ id: user.id, telephone: user.telephone, nom: user.nom, prenom: user.prenom, image: user.photo, type: user.type, solde: user.solde }, secret, { expiresIn: '30d' });
            return res.status(200).json({ message: 'OTP vérifié.', token });
        });
    }
    static verifyPin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { pin } = req.body;
            const telephone = (_a = req.user) === null || _a === void 0 ? void 0 : _a.telephone;
            const user = yield prisma_1.default.user.findFirst({
                where: { telephone },
            });
            if (!user) {
                return res.status(404).json({ message: 'Utilisateur non trouvé.' });
            }
            if (user.codeSecret !== pin) {
                return res.status(401).json({ message: 'Code PIN incorrect.' });
            }
            const sessionToken = jsonwebtoken_1.default.sign({ id: user.id, sessionId: new Date().getTime() }, process.env.SECRET_KEY, { expiresIn: '5m' });
            return res.status(200).json({ message: 'Connexion réussie.', sessionToken });
        });
    }
    static createUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nom, prenom, mail, telephone, codeSecret, type, urls } = req.body;
            const { infosImages, photo } = urls || {};
            const validTypes = ['simple', 'agent', 'marchand', 'entreprise'];
            if (!validTypes.includes(type)) {
                return res.status(400).json({ message: "Type de compte invalide." });
            }
            try {
                const existingUser = yield prisma_1.default.user.findFirst({
                    where: { OR: [{ mail }, { telephone }] },
                });
                if (existingUser) {
                    return res.status(400).json({ message: "L'utilisateur existe déjà." });
                }
                const soldeInitial = 0.0;
                const plafondInitial = type === 'marchand' || type === 'entreprise' ? 10000.0 : 5000.0;
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
                        photo: photo ? photo[0] : null,
                        identifiant: `${prenom} ${telephone}`,
                    },
                });
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
    static getSimpleUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield prisma_1.default.user.findMany({
                    where: { type: 'client' },
                    select: { id: true, nom: true, prenom: true, photo: true, telephone: true, identifiant: true },
                });
                return res.status(200).json({ success: true, message: 'Clients récupérés avec succès', data: users });
            }
            catch (error) {
                console.error("Erreur lors de la récupération des utilisateurs simples:", error);
                return res.status(500).json({ message: "Erreur lors de la récupération des utilisateurs simples." });
            }
        });
    }
    static getEntrepriseUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield prisma_1.default.user.findMany({
                    where: { type: 'societe' },
                    select: { id: true, nom: true, prenom: true, photo: true, telephone: true, identifiant: true, type_societe: true },
                });
                return res.status(200).json({ users });
            }
            catch (error) {
                console.error("Erreur lors de la récupération des utilisateurs entreprises:", error);
                return res.status(500).json({ message: "Erreur lors de la récupération des utilisateurs entreprises." });
            }
        });
    }
    //get info connected user
    static getConnectedUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = req.user;
            if (!user) {
                return res.status(401).json({ message: 'Utilisateur non connecté.', data: null, 'error': 'aucun utilisateur connecté' });
            }
            return res.status(200).json({ message: 'Utilisateur connecté.', data: user, 'error': null });
        });
    }
}
exports.default = UserController2;
