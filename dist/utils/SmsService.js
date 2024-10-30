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
const twilio_1 = __importDefault(require("twilio"));
class SmsService {
    static initializeClient() {
        if (!SmsService.client) {
            const accountSid = process.env.TWILIO_SID;
            const authToken = process.env.TWILIO_AUTH_TOKEN;
            SmsService.client = (0, twilio_1.default)(accountSid, authToken);
        }
    }
    /**
     * Sends an SMS.
     * @param to The recipient's phone number.
     * @param message The message to send.
     */
    static sendSms(to, message) {
        return __awaiter(this, void 0, void 0, function* () {
            // Initialize the Twilio client if it hasn't been created yet
            SmsService.initializeClient();
            if (!SmsService.client) {
                throw new Error("Twilio client is not initialized");
            }
            try {
                yield SmsService.client.messages.create({
                    body: message,
                    from: process.env.TWILIO_PHONE_NUMBER, // Your Twilio number
                    to: `+221${to}`,
                });
                console.log(`SMS sent to ${to}`);
            }
            catch (error) {
                console.error('Error while sending SMS:', error);
                throw new Error('Erreur lors de l\'envoi du SMS');
            }
        });
    }
}
SmsService.client = null;
exports.default = SmsService;
