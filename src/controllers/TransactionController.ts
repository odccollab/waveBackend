import { Request, Response } from 'express';
import prisma from '@prisma/client';
import User from "../models/User";
class TransactionController {
    // static async getTransactions(req: Request, res: Response): Promise<Response> {}
    static async transaction(sender:User){}
}