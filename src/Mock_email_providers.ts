export interface IEmailProvider {
    sendEmail(to: string, subject: string, body: string): Promise<boolean>;
}

export class MockEmailProvider1 implements IEmailProvider {
    async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
        // Randomly simulate a failure
        if (Math.random() > 0.7) {
            console.log('MockEmailProvider1: Failed to send email');
            return false;
        }
        console.log('MockEmailProvider1: Email sent successfully');
        return true;
    }
}

export class MockEmailProvider2 implements IEmailProvider {
    async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
        // Randomly simulate a failure
        if (Math.random() > 0.7) {
            console.log('MockEmailProvider2: Failed to send email');
            return false;
        }
        console.log('MockEmailProvider2: Email sent successfully');
        return true;
    }
}
