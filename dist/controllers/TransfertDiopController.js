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
const prisma_1 = __importDefault(require("../prisma"));
const UserController2_1 = require("./UserController2");
const redisClient_1 = __importDefault(require("../redisClient"));
const MailerService_1 = __importDefault(require("../utils/MailerService"));
const TransactionController_1 = __importDefault(require("./TransactionController"));
class TransactionController {
    // First Endpoint: Initiate Withdrawal
    retrait1(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const agent = req.user; // The logged-in agent
            const { telephone, montant } = req.body; // Client's phone and amount to withdraw
            try {
                // Ensure the agent is authorized and account is not capped for withdrawals
                if (agent.type !== 'agent') {
                    return res.status(403).json({ message: 'Only agents can initiate withdrawals.' });
                }
                // Find the client by phone number
                const client = yield prisma_1.default.user.findUnique({ where: { telephone } });
                if (!client) {
                    return res.status(404).json({ message: 'Client not found.' });
                }
                // Check if client has sufficient balance for the withdrawal
                if (client.solde < montant) {
                    return res.status(400).json({ message: 'Insufficient funds for withdrawal.' });
                }
                // Generate a unique code for the withdrawal
                const code = (0, UserController2_1.generateOtp)();
                // Store the client info, transaction type, and amount in Redis
                const redisKey = `${agent.telephone}:${code}`;
                const cacheData = JSON.stringify({
                    clientId: client.id,
                    montant,
                    type: 'retrait',
                });
                yield redisClient_1.default.set(redisKey, cacheData, { EX: 300 }); // Expires after 5 minutes
                // Send the code to the client via email
                yield MailerService_1.default.sendEmail(client.mail, 'Code de Retrait', `Vous allez retirez ${montant} voici le code : ${code}`);
                return res.status(200).json({ message: 'code de  code sent. Please check your email.' });
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ message: 'An error occurred while initiating the withdrawal.' });
            }
        });
    }
    retrait2(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let agent = req.user; // The logged-in agent
            const { code } = req.body;
            const agent2 = yield prisma_1.default.user.findUnique({
                where: {
                    telephone: agent.telephone
                }
            });
            try {
                const redisKey = `${agent.telephone}:${code}`;
                // Retrieve data from Redis using `await` with the modern client
                const cacheData = yield redisClient_1.default.get(redisKey);
                if (!cacheData) {
                    return res.status(400).json({ message: 'Invalid or expired code.' });
                }
                // Parse cache data
                const { clientId, montant, type } = JSON.parse(cacheData);
                // Find the client by ID
                const clientData = yield prisma_1.default.user.findUnique({ where: { id: clientId } });
                if (!clientData || clientData.solde < montant) {
                    return res.status(400).json({ message: 'Transaction failed. Insufficient funds.' });
                }
                const transaction = yield TransactionController_1.default.transaction(agent2, montant, "retrait", clientData.telephone);
                // Perform the withdrawal
                // Delete the Redis key after a successful transaction
                yield redisClient_1.default.del(redisKey);
                return res.status(200).json({ message: 'Withdrawal successful', transaction });
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ message: 'An error occurred while confirming the withdrawal.' });
            }
        });
    }
}
exports.default = new TransactionController();
