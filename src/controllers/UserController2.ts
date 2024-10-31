import { Request, Response } from 'express';
import redisClient from '../redisClient';
import jwt from 'jsonwebtoken';
import prisma from "../prisma";
import MailerService from "../utils/MailerService";
import smsService from "../utils/SmsService";
// Générer un OTP à 6 chiffres
export const generateOtp = (): string => Math.floor(100000 + Math.random() * 900000).toString();

class UserController2 {
    static async requestOtp(req: Request, res: Response) {
        const {phoneNumber} = req.body;
        console.log(phoneNumber)
        // Vérifier si l'utilisateur existe
        const user = await prisma.user.findFirst({
            where: {
                telephone: phoneNumber,
            }
        });
        console.log(user)
        if (!user) {
            return res.status(404).json({message: 'Utilisateur non trouvé.'});
        }

        // Générer un OTP et le stocker dans Redis avec une expiration (5 minutes)
        const otp = generateOtp();
        await redisClient.set(`otp_${phoneNumber}`, otp, {EX: 300});
await MailerService.sendEmail(user.mail, "Authentification", "voici votre code : "+otp)
        // await smsService.sendSms(user.telephone, "voici votre code : "+otp);
        // Log ou envoi du code OTP (SMS)
        console.log(`Code OTP pour ${phoneNumber} : ${otp}`);

        return res.status(200).json({message: 'Code OTP envoyé.'});
    }

    static async verifyOtp(req: Request, res: Response) {
        const {phoneNumber, otp} = req.body;

        // Récupérer l’OTP depuis Redis
        const storedOtp = await redisClient.get(`otp_${phoneNumber}`);
        console.log("ddddd",storedOtp)
        if (storedOtp !== otp) {
            return res.status(401).json({message: 'OTP incorrect ou expiré.'});
        }

        await redisClient.del(`otp_${phoneNumber}`);

        const user = await prisma.user.findFirst({
            where: {
                telephone: phoneNumber,
            }
        });
        let secret = process.env.SECRET_KEY
        const token = jwt.sign({id: user!.id, telephone: user!.telephone,nom:user!.nom,prenom:user!.prenom,image:user!.photo,type:user!.type},secret! , {
            expiresIn: '30d',
        });

        return res.status(200).json({message: 'OTP vérifié.', token});
    }

    static async verifyPin(req: Request, res: Response) {
        const { pin } = req.body;
        console.log(req.body)
        const telephone = req.user?.telephone; // Utiliser les informations de req.user

        const user = await prisma.user.findFirst({
            where: { telephone }
        });

        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé.' });
        }
        console.log(user)
        // Vérification du code PIN
        if (user.codeSecret != pin) {
            return res.status(401).json({ message: 'Code PIN incorrect.' });
        }

        // Création d'un sessionToken pour la session utilisateur
        const sessionToken = jwt.sign(
            { userId: user.id, sessionId: new Date().getTime() }, // Identifiant de session unique
            process.env.SECRET_KEY as string,
            { expiresIn: '5m' }
        );

        return res.status(200).json({
            message: 'Connexion réussie.',
            sessionToken: sessionToken
        });
    }
    static async createUser(req: Request, res: Response) {
        const { nom, prenom, mail, telephone, codeSecret, type } = req.body;

        let { infosImages ,photo} = req.body.urls || {}; // URLs des images recto-verso
        photo=photo[0]
        // Vérifier que le type est valide
        const validTypes = ['simple', 'agent', 'marchand', 'entreprise'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({ message: "Type de compte invalide." });
        }
        try {
            // Vérifier si l'utilisateur existe déjà
            const existingUser = await prisma.user.findFirst({
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
                    photo,
                    identifiant: `${prenom} ${telephone}`
                },
            });

            // Ajouter les URLs des images de la carte d'identité (recto, verso) à `ContenuMedia`
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

    //get user where type = simple
    static async getSimpleUsers(req: Request, res: Response) {
        try {
            const users = await prisma.user.findMany({
                where: { type:'client' },
                select: {
                    id: true,
                    nom: true,
                    prenom: true,
                    photo: true,
                    telephone: true,
                    identifiant: true,
                },
            });
            return res.status(200).json({ users });
        } catch (error) {
            console.error("Erreur lors de la récupération des utilisateurs simples:", error);
            return res.status(500).json({ message: "Erreur lors de la récupération des utilisateurs simples." });
        }
    }

    //get user where type= societe
    static async getEntrepriseUsers(req: Request, res: Response) {
        try {
            const users = await prisma.user.findMany({
                where: { type:'societe' },
                select: {
                    id: true,
                    nom: true,
                    prenom: true,
                    photo: true,
                    telephone: true,
                    identifiant: true,
                },
            });
            return res.status(200).json({ users });
        } catch (error) {
            console.error("Erreur lors de la récupération des utilisateurs entreprises:", error);
            return res.status(500).json({ message: "Erreur lors de la récupération des utilisateurs entreprises." });
        }
    }

    //get user where type = agent


}

export default UserController2;