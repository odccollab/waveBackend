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
const nodemailer_1 = __importDefault(require("nodemailer"));
class MailerService {
    static initializeTransporter() {
        if (!MailerService.transporter) {
            // Set up SMTP transporter with authentication information
            MailerService.transporter = nodemailer_1.default.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });
        }
    }
    /**
     * Sends an email.
     * @param to The recipient's email address.
     * @param subject The email subject.
     * @param text The text message to send.
     * @param html (Optional) The HTML content of the email.
     * @param attachments (Optional) An array of attachment objects.
     */
    static sendEmail(to, subject, text, html, attachments) {
        return __awaiter(this, void 0, void 0, function* () {
            // Initialize transporter if it hasn't been created yet
            MailerService.initializeTransporter();
            if (!MailerService.transporter) {
                throw new Error("SMTP transporter is not initialized");
            }
            try {
                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to,
                    subject,
                    text,
                    html,
                    attachments,
                };
                // Send the email
                yield MailerService.transporter.sendMail(mailOptions);
                console.log(`E-mail sent to ${to}`);
            }
            catch (error) {
                console.error('Error while sending email:', error);
                throw new Error("Erreur lors de l'envoi de l'e-mail");
            }
        });
    }
}
MailerService.transporter = null;
exports.default = MailerService;
