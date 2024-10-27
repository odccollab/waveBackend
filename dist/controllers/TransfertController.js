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
exports.TransfertController = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const TransactionController_1 = require("./TransactionController");
class TransferController {
    constructor() {
        this.processWithdrawal = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                // Validate request body
                const { clientPhone, amount, agentPhone } = req.body;
                if (!clientPhone || !amount || !agentPhone) {
                    return res.status(400).json({
                        success: false,
                        message: 'Missing required fields: clientPhone, amount, agentPhone'
                    });
                }
                // Find the client (sender)
                const client = yield prisma_1.default.user.findUnique({
                    where: { telephone: clientPhone }
                });
                // Verify client exists
                if (!client) {
                    return res.status(404).json({
                        success: false,
                        message: 'Client not found'
                    });
                }
                // Find the agent (receiver)
                const agent = yield prisma_1.default.user.findUnique({
                    where: { telephone: agentPhone }
                });
                // Verify agent exists and is a pro
                if (!agent || agent.type !== 'pro') {
                    return res.status(404).json({
                        success: false,
                        message: 'Agent not found or not authorized for withdrawals'
                    });
                }
                // Process the withdrawal using TransactionController
                const transactionResult = yield this.transactionController.transaction(client, amount, 'retrait', agentPhone // Use agent's phone number instead of client's
                );
                // Handle transaction response
                if (typeof transactionResult === 'string') {
                    // Transaction failed with error message
                    return res.status(400).json({
                        success: false,
                        message: transactionResult
                    });
                }
                // Transaction successful
                return res.status(200).json({
                    success: true,
                    message: 'Withdrawal processed successfully',
                    data: {
                        transaction: transactionResult,
                        newBalance: transactionResult.solde_sender,
                        clientPhone: clientPhone,
                        agentPhone: agentPhone,
                        amount: amount
                    }
                });
            }
            catch (error) {
                console.error('Withdrawal error:', error);
                return res.status(500).json({
                    success: false,
                    message: 'An error occurred while processing the withdrawal'
                });
            }
        });
        this.transactionController = new TransactionController_1.TransactionController();
    }
}
// Export controller instance
exports.TransfertController = new TransferController();
