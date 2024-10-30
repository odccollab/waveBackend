import { Request, Response } from 'express';
import prisma from "../prisma";
import {generateOtp} from "./UserController2";
import redisClient from '../redisClient';
import MailerService from "../utils/MailerService";
import TrController from "./TransactionController";
class TransactionController {
    // First Endpoint: Initiate Withdrawal
    async retrait1(req: Request, res: Response): Promise<Response> {
        const agent = req.user!; // The logged-in agent
        const { telephone, montant } = req.body; // Client's phone and amount to withdraw

        try {
            // Ensure the agent is authorized and account is not capped for withdrawals
            if (agent.type !== 'agent') {
                return res.status(403).json({ message: 'Only agents can initiate withdrawals.' });
            }

            // Find the client by phone number
            const client = await prisma.user.findUnique({ where: { telephone } });
            if (!client) {
                return res.status(404).json({ message: 'Client not found.' });
            }

            // Check if client has sufficient balance for the withdrawal
            if (client.solde < montant) {
                return res.status(400).json({ message: 'Insufficient funds for withdrawal.' });
            }

            // Generate a unique code for the withdrawal
            const code = generateOtp();

            // Store the client info, transaction type, and amount in Redis
            const redisKey = `${agent.telephone}:${code}`;
            const cacheData = JSON.stringify({
                clientId: client.id,
                montant,
                type: 'retrait',
            });
            await redisClient.set(redisKey, cacheData, { EX: 300 }); // Expires after 5 minutes

            // Send the code to the client via email
            await MailerService.sendEmail(client.mail, 'Code de Retrait', `Vous allez retirez ${montant} voici le code : ${code}`);

            return res.status(200).json({ message: 'code de  code sent. Please check your email.' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'An error occurred while initiating the withdrawal.' });
        }
    }
    async retrait2(req: Request, res: Response): Promise<Response> {
        let agent = req.user!; // The logged-in agent

        const { code } = req.body;
        const agent2 = await prisma.user.findUnique({
            where:{
                telephone:agent.telephone
            }
        })
        try {

            const redisKey = `${agent.telephone}:${code}`;

            // Retrieve data from Redis using `await` with the modern client
            const cacheData = await redisClient.get(redisKey);
            if (!cacheData) {
                return res.status(400).json({ message: 'Invalid or expired code.' });
            }

            // Parse cache data
            const { clientId, montant, type } = JSON.parse(cacheData);

            // Find the client by ID
            const clientData = await prisma.user.findUnique({ where: { id: clientId } });
            if (!clientData || clientData.solde < montant) {
                return res.status(400).json({ message: 'Transaction failed. Insufficient funds.' });
            }
        const transaction=  await  TrController.transaction(agent2!,montant,"retrait",clientData.telephone)
            // Perform the withdrawal


            // Delete the Redis key after a successful transaction
            await redisClient.del(redisKey);

            return res.status(200).json({ message: 'Withdrawal successful', transaction });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'An error occurred while confirming the withdrawal.' });
        }
    }
}

export default new TransactionController();