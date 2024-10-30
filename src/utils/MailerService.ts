import nodemailer from 'nodemailer';
import { SendMailOptions } from 'nodemailer';

class MailerService {
    private static transporter: nodemailer.Transporter | null = null;

    private static initializeTransporter() {
        if (!MailerService.transporter) {
            // Set up SMTP transporter with authentication information
            MailerService.transporter = nodemailer.createTransport({
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
    public static async sendEmail(
        to: string,
        subject: string,
        text: string,
        html?: string,
        attachments?: Array<{ filename: string; path: string }>
    ): Promise<void> {
        // Initialize transporter if it hasn't been created yet
        MailerService.initializeTransporter();

        if (!MailerService.transporter) {
            throw new Error("SMTP transporter is not initialized");
        }

        try {
            const mailOptions: SendMailOptions = {
                from: process.env.EMAIL_USER,
                to,
                subject,
                text,
                html,
                attachments,
            };

            // Send the email
            await MailerService.transporter.sendMail(mailOptions);
            console.log(`E-mail sent to ${to}`);
        } catch (error) {
            console.error('Error while sending email:', error);
            throw new Error("Erreur lors de l'envoi de l'e-mail");
        }
    }
}

export default MailerService;
