import { Request, Response } from 'express';
import redisClient from '../redisClient';
import jwt from 'jsonwebtoken';
import prisma from "../prisma";
import MailerService from "../utils/MailerService";
import smsService from "../utils/SmsService";

export const generateOtp = (): string => Math.floor(100000 + Math.random() * 900000).toString();

// interface CustomRequest extends Request {
//     user?: { id: number; telephone: string; nom: string; prenom: string; image: string; type: string };
// }

class UserController2 {
    static async requestOtp(req: Request, res: Response) {
        const { phoneNumber } = req.body;

        // Vérifier si l'utilisateur existe
        const user = await prisma.user.findFirst({
            where: { telephone: phoneNumber },
        });
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé.' });
        }

        // Générer un OTP et le stocker dans Redis avec une expiration (5 minutes)
        const otp = generateOtp();
        await redisClient.set(`otp_${phoneNumber}`, otp, { EX: 300 });
        await MailerService.sendEmail(user.mail, "Authentification", `Voici votre code : ${otp}`);
        // await smsService.sendSms(user.telephone, `Voici votre code : ${otp}`);

        console.log(`Code OTP pour ${phoneNumber} : ${otp}`);
        return res.status(200).json({ message: 'Code OTP envoyé.' ,data:otp});
    }

    static async verifyOtp(req: Request, res: Response) {
        const { phoneNumber, otp } = req.body;

        // Récupérer l’OTP depuis Redis
        const storedOtp = await redisClient.get(`otp_${phoneNumber}`);
        if (storedOtp !== otp) {
            return res.status(401).json({ message: 'OTP incorrect ou expiré.' });
        }

        await redisClient.del(`otp_${phoneNumber}`);

        const user = await prisma.user.findFirst({
            where: { telephone: phoneNumber },
        });
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé.' });
        }

        const secret = process.env.SECRET_KEY!;
        const token = jwt.sign(
            { id: user!.id, telephone: user!.telephone, nom: user!.nom, prenom: user!.prenom, image: user!.photo, type: user!.type ,solde:user!.solde},
            secret,
            { expiresIn: '30d' }
        );

        return res.status(200).json({ message: 'OTP vérifié.', token });
    }

    static async verifyPin(req: Request, res: Response) {
        const { pin } = req.body;
        const telephone = req.user?.telephone;

        const user = await prisma.user.findFirst({
            where: { telephone },
        });
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé.' });
        }

        if (user.codeSecret !== pin) {
            return res.status(401).json({ message: 'Code PIN incorrect.' });
        }

        const sessionToken = jwt.sign(
            { id: user.id, sessionId: new Date().getTime() },
            process.env.SECRET_KEY as string,
            { expiresIn: '5m' }
        );

        return res.status(200).json({ message: 'Connexion réussie.', sessionToken });
    }

    static async createUser(req: Request, res: Response) {
        const { nom, prenom, mail, telephone, codeSecret, type, urls } = req.body;
        const { infosImages, photo } = urls || {};

        const validTypes = ['simple', 'agent', 'marchand', 'entreprise'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({ message: "Type de compte invalide." });
        }

        try {
            const existingUser = await prisma.user.findFirst({
                where: { OR: [{ mail }, { telephone }] },
            });
            if (existingUser) {
                return res.status(400).json({ message: "L'utilisateur existe déjà." });
            }

            const soldeInitial = 0.0;
            const plafondInitial = type === 'marchand' || type === 'entreprise' ? 10000.0 : 5000.0;

            const newUser = await prisma.user.create({
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
                await prisma.contenuMedia.createMany({
                    data: infosImages.map((url: string) => ({
                        url,
                        userId: newUser.id,
                    })),
                });
            }
            return res.status(201).json({ message: "Utilisateur créé avec succès.", user: newUser });
        } catch (error) {
            console.error("Erreur lors de la création de l'utilisateur:", error);
            return res.status(500).json({ message: "Erreur lors de la création de l'utilisateur." });
        }
    }

    static async getSimpleUsers(req: Request, res: Response) {
        try {
            const users = await prisma.user.findMany({
                where: { type: 'client' },
                select: { id: true, nom: true, prenom: true, photo: true, telephone: true, identifiant: true },
            });
            return res.status(200).json({ success: true, message: 'Clients récupérés avec succès', data: users });
        } catch (error) {
            console.error("Erreur lors de la récupération des utilisateurs simples:", error);
            return res.status(500).json({ message: "Erreur lors de la récupération des utilisateurs simples." });
        }
    }

    static async getEntrepriseUsers(req: Request, res: Response) {
        try {
            const users = await prisma.user.findMany({
                where: { type: 'societe' },
                select: { id: true, nom: true, prenom: true, photo: true, telephone: true, identifiant: true ,type_societe: true},
            });
            return res.status(200).json({ users });
        } catch (error) {
            console.error("Erreur lors de la récupération des utilisateurs entreprises:", error);
            return res.status(500).json({ message: "Erreur lors de la récupération des utilisateurs entreprises." });
        }
    }

    //get info connected user
    static async getConnectedUser(req: Request, res: Response) {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: 'Utilisateur non connecté.',data:null , 'error' : 'aucun utilisateur connecté'});
        }
        return res.status(200).json({message: 'Utilisateur connecté.', data: user, 'error':null });
        
    }

    //update info connected user
  

}

export default UserController2;
