import twilio from 'twilio';

class SmsService {
    private static client: twilio.Twilio | null = null;

    private static initializeClient() {
        if (!SmsService.client) {
            const accountSid = process.env.TWILIO_SID;
            const authToken = process.env.TWILIO_AUTH_TOKEN;
            SmsService.client = twilio(accountSid, authToken);
        }
    }

    /**
     * Sends an SMS.
     * @param to The recipient's phone number.
     * @param message The message to send.
     */
    public static async sendSms(to: string, message: string): Promise<void> {
        // Initialize the Twilio client if it hasn't been created yet
        SmsService.initializeClient();

        if (!SmsService.client) {
            throw new Error("Twilio client is not initialized");
        }

        try {
            await SmsService.client.messages.create({
                body: message,
                from: process.env.TWILIO_PHONE_NUMBER, // Your Twilio number
                to: `+221${to}`,
            });
            console.log(`SMS sent to ${to}`);
        } catch (error) {
            console.error('Error while sending SMS:', error);
            throw new Error('Erreur lors de l\'envoi du SMS');
        }
    }
}

export default SmsService;
