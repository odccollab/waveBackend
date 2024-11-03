import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import type { File } from 'multer';
import UserModel from '../models/User';
import validationSchemas from "../utils/SchemaValidation";
import prisma from "../prisma";
import CloudUploadService from "../services/CloudUploadService";

// Type definitions
type ValidationSchemaKey = 'register' | 'login' | 'post' | 'comment'|'article'|'commande';

declare module 'express-serve-static-core' {
    interface Request {
        user?: {
            id: string;
            nom: string;
            prenom: string;
            image: string;
            solde:number;
            type: string;
            telephone: string;

        };
        files?: { [fieldname: string]: Express.Multer.File[] };
        sessionUser?:{
            id: string;
            nom: string;
            prenom: string;
            image: string;
            solde: number;
            type: string;
            telephone: string;
        }
    }
}

interface MulterRequest extends Request {
    file?: File;
    files?: { [fieldname: string]: File[] };
}