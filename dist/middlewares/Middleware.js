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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// import UserModel from '../models/User';
const SchemaValidation_1 = __importDefault(require("../utils/SchemaValidation"));
const CloudUploadService_1 = __importDefault(require("../services/CloudUploadService"));
class Middleware {
    verifyToken(req, res, next) {
        var _a;
        try {
            console.log("Verifying token...");
            const token = (_a = req.header("Authorization")) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
            if (!token) {
                return res.status(401).json({ error: 'No token provided' });
            }
            const decoded = jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY);
            console.log(decoded);
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
        }
        catch (error) {
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
    validateData(key) {
        return (req, res, next) => {
            const schema = SchemaValidation_1.default[key];
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
    dynamicUploadMiddleware(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("Request body and files before processing:", req.body, req.files);
                const uploadedUrls = {};
                if (req.files) {
                    const filesObject = req.files;
                    for (const fieldName in filesObject) {
                        const files = filesObject[fieldName];
                        if (files && files.length > 0) {
                            // Upload chaque fichier avec CloudUploadService et obtenir les URLs
                            const urls = yield CloudUploadService_1.default.uploadFiles(files);
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
            }
            catch (error) {
                console.error("Error uploading files:", error);
                res.status(500).json({ message: "Failed to upload files" });
            }
        });
    }
    verifySessionToken(req, res, next) {
        try {
            const sessionToken = req.header("x-session-token");
            if (!sessionToken) {
                return res.status(401).json({ error: 'Le token de session est requis.' });
            }
            const decodedSession = jsonwebtoken_1.default.verify(sessionToken, process.env.SECRET_KEY);
            next();
        }
        catch (error) {
            return res.status(401).json({ error: 'Token de session invalide.' });
        }
    }
}
exports.default = new Middleware();
