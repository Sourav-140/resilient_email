
// All six Unit Test cases


import { EmailService } from '../src/Email_service';
import { EmailProvider } from '../src/Mock_email_providers';

class MockSuccessProvider implements EmailProvider {
    async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
        return true;
    }
}

class MockFailureProvider implements EmailProvider {
    async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
        return false;
    }
}

describe('EmailService', () => {
    it('should successfully send an email using the first provider', async () => {
        const emailService = new EmailService();
        const result = await emailService.sendEmail('test@gmail.com', 'Subject', 'Body');
        expect(result.success).toBe(true);
        expect(result.provider).toBe('MockEmailProvider1');
    });

    it('should fall back to the second provider if the first fails', async () => {
        const emailService = new EmailService();
        emailService['providers'] = [new MockFailureProvider(), new MockSuccessProvider()];
        const result = await emailService.sendEmail('test@gmail.com', 'Subject', 'Body');
        expect(result.success).toBe(true);
        expect(result.provider).toBe('MockSuccessProvider');
    });

    it('should respect the retry mechanism and return failure after max retries', async () => {
        const emailService = new EmailService(2);
        emailService['providers'] = [new MockFailureProvider(), new MockFailureProvider()];
        const result = await emailService.sendEmail('test@gmail.com', 'Subject', 'Body');
        expect(result.success).toBe(false);
        expect(result.attempts).toBe(2);
    });

    it('should not send the same email twice due to idempotency', async () => {
        const emailService = new EmailService();
        await emailService.sendEmail('test@gmail.com', 'Subject', 'Body');
        const result = await emailService.sendEmail('test@gmail.com', 'Subject', 'Body');
        expect(result.success).toBe(true);
        expect(result.provider).toBe('Idempotency');
    });

    it('should open circuit after max failures and not attempt sending', async () => {
        const emailService = new EmailService(2);
        emailService['providers'] = [new MockFailureProvider()];
        await emailService.sendEmail('test@gmail.com', 'Subject', 'Body');
        await emailService.sendEmail('test@gmail.com', 'Subject', 'Body');
        const result = await emailService.sendEmail('test@gmail.com', 'Subject', 'Body');
        expect(result.success).toBe(false);
        expect(result.provider).toBe('');
    });

    it('should respect rate limiting and return failure after exceeding limit', async () => {
        const emailService = new EmailService(3, 2);
        emailService['providers'] = [new MockFailureProvider()];
        await emailService.sendEmail('test@gmail.com', 'Subject', 'Body');
        await emailService.sendEmail('test@gmail.com', 'Subject', 'Body');
        const result = await emailService.sendEmail('test@gmail.com', 'Subject', 'Body');
        expect(result.success).toBe(false);
        expect(result.attempts).toBe(2);
    });
});
