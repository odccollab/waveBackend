import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
// import UserModel from '../models/User';
import validationSchemas from "../utils/SchemaValidation";
import prisma from "../prisma";
import CloudUploadService from "../services/CloudUploadService";

class Middleware {

    public verifyToken(req: Request, res: Response, next: NextFunction) {
        try {


            console.log("Verifying token...");
            const token = req.header("Authorization")?.replace('Bearer ', '');
            if (!token) {
                return res.status(401).json({ error: 'No token provided' });
            }

            const decoded = jwt.verify(token, process.env.SECRET_KEY as string) as jwt.JwtPayload;

            req.user = {
                id: decoded.id,
                nom: decoded.nom,
                prenom: decoded.prenom,
                image: decoded.image,
                type: decoded.type,
                telephone: decoded.telephone
            };
            console.log(req.user.id);

            next();
        } catch (error) {
            res.status(401).json({ error: 'Access denied, token is invalid' });
        }
    }

    // public async canPost(req: Request, res: Response, next: NextFunction) {
    //     try {
    //         const userId = req.user?.id;
    //         const user = await UserModel.findUnique({id:userId});
    //
    //         if (!user) return res.status(404).json({ error: 'User not found' });
    //
    //         if (user.credit < 1) {
    //             return res.status(403).json({ error: 'Cannot continue this operation, insufficient credit' });
    //         }
    //
    //         next();
    //     } catch (error) {
    //         res.status(401).json({ error: 'Access denied, token is invalid' });
    //     }
    // }

    public validateData(key: string) {
        return (req: Request, res: Response, next: NextFunction) => {
            const schema  = validationSchemas[key];

            if (!schema) {
                return res.status(400).json({ error: "No validation schema found for key: " + key });
            }

            const { error } = schema.safeParse(req.body);

            if (error) {
                return res.status(400).json({ error: error.errors });
            }

            next();
        };
    }
    // canValidateOrder = async (req: Request, res: Response, next: NextFunction) => {
    //     const userId = +req.user?.id!;
    //     const orderId = parseInt(req.params.orderId, 10);
    //     console.log(req.params)
    //     if (!userId || !orderId) {
    //         return res.status(401).json({ message: "Utilisateur non authentifié ou commande non spécifiée" });
    //     }
    //
    //     // Vérifiez si la commande appartient au vendeur spécifié
    //     const order = await prisma.commande.findUnique({
    //         where: { id: orderId },
    //         include: { user: true }, // Inclure l'utilisateur (vendeur) pour vérification
    //     });
    //     console.log(order!.idVendeur !== +userId)
    //     console.log(order!.user.id !== +userId)
    //     console.log(!order)
    //     if (!order ||(order.user.id !== +userId&&order.idVendeur !== +userId)  ) {
    //         return res.status(403).json({ message: "Vous n'êtes pas autorisé à valider cette commande" });
    //     }
    //
    //     next();
    // };
    public async dynamicUploadMiddleware(req: Request, res: Response, next: NextFunction) {
        try {
            console.log("Request body and files before processing:", req.body, req.files);
            const uploadedUrls: { [key: string]: string[] } = {};

            if (req.files) {
                const filesObject = req.files as { [key: string]: Express.Multer.File[] };

                for (const fieldName in filesObject) {
                    const files = filesObject[fieldName];

                    if (files && files.length > 0) {
                        // Upload chaque fichier avec CloudUploadService et obtenir les URLs
                        const urls = await CloudUploadService.uploadFiles(files);
                        uploadedUrls[fieldName] = Array.isArray(urls) ? urls : [urls]; // Assurez-vous d'avoir un tableau d'URLs
                    }
                }
            }

            // Assignation des URLs téléchargés à req.body.contenuMedia
            if (uploadedUrls) {
                req.body.urls = uploadedUrls;
            }

            console.log("Request body after uploading files:", uploadedUrls);
            next();
        } catch (error) {
            console.error("Error uploading files:", error);
            res.status(500).json({ message: "Failed to upload files" });
        }
    }
    public  verifySessionToken(req: Request, res: Response, next: NextFunction) {
        try {
            const sessionToken = req.header("x-session-token");
            if (!sessionToken) {
                return res.status(401).json({ error: 'Le token de session est requis.' });
            }
            const decodedSession = jwt.verify(sessionToken, process.env.SECRET_KEY as string) as jwt.JwtPayload;
            next();
        } catch (error) {
            return res.status(401).json({ error: 'Token de session invalide.' });
        }
    }
}
export default new Middleware();