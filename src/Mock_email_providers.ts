export interface EmailProvider {
    sendEmail(to: string, subject: string, body: string): Promise<boolean>;
}

export class MockEmailProvider1 implements EmailProvider {
    async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
        
        if (Math.random() > 0.7) {                      // Randomly ceate a failure
            console.log('MockEmailProvider1: Failed to send an email');
            return false;
        }
        console.log('MockEmailProvider1: Email sent successfully');
        return true;
    }
}

export class MockEmailProvider2 implements EmailProvider {
    async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
        
        if (Math.random() > 0.7) {                      // Randomly create a failure
            console.log('MockEmailProvider2: Failed to send an email');
            return false;
        }
        console.log('MockEmailProvider2: Email sent successfully');
        return true;
    }
}
