// src/EmailService.ts
import { IEmailProvider, MockEmailProvider1, MockEmailProvider2 } from './Mock_email_providers';

interface EmailStatus {
    success: boolean;
    attempts: number;
    provider: string;
}

export class EmailService {
    private providers: IEmailProvider[];
    private maxRetries: number;
    private rateLimit: number;
    private attemptCounts: Map<string, number>;
    private sentEmails: Set<string>;
    private failureCounts: Map<string, number>;
    private circuitOpen: Map<string, boolean>;

    constructor(maxRetries: number = 3, rateLimit: number = 5) {
        this.providers = [new MockEmailProvider1(), new MockEmailProvider2()];
        this.maxRetries = maxRetries;
        this.rateLimit = rateLimit;
        this.attemptCounts = new Map<string, number>();
        this.sentEmails = new Set<string>();
        this.failureCounts = new Map<string, number>();
        this.circuitOpen = new Map<string, boolean>();
    }

    private async sendWithProvider(
        provider: IEmailProvider,
        to: string,
        subject: string,
        body: string,
        attempt: number = 0
    ): Promise<boolean> {
        const providerName = provider.constructor.name;
        
        if (this.circuitOpen.get(providerName)) {
            console.log(`Circuit open for ${providerName}`);
            return false;
        }

        try {
            if (await provider.sendEmail(to, subject, body)) {
                this.failureCounts.set(providerName, 0); // Reset failures on success
                return true;
            }
            throw new Error('Provider failed to send email');
        } catch (error) {
            const failureCount = this.failureCounts.get(providerName) || 0;
            this.failureCounts.set(providerName, failureCount + 1);

            if (this.shouldOpenCircuit(provider)) {
                this.circuitOpen.set(providerName, true);
                console.log(`Circuit opened for ${providerName}`);
                setTimeout(() => this.circuitOpen.set(providerName, false), 60000); // Reopen circuit after 1 minute
            }

            if (attempt < this.maxRetries) {
                await this.delay((2 ** attempt) * 100); // Exponential backoff
                return this.sendWithProvider(provider, to, subject, body, attempt + 1);
            }
            return false;
        }
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    private incrementAttempt(to: string): void {
        this.attemptCounts.set(to, (this.attemptCounts.get(to) || 0) + 1);
    }

    private checkRateLimit(to: string): boolean {
        return (this.attemptCounts.get(to) || 0) < this.rateLimit;
    }

    private shouldOpenCircuit(provider: IEmailProvider): boolean {
        const failureCount = this.failureCounts.get(provider.constructor.name) || 0;
        return failureCount >= this.maxRetries;
    }

    public async sendEmail(
        to: string,
        subject: string,
        body: string
    ): Promise<EmailStatus> {
        const emailId = `${to}-${subject}-${body}`;
        if (this.sentEmails.has(emailId)) {
            return { success: true, attempts: 0, provider: 'Idempotency' };
        }

        if (!this.checkRateLimit(to)) {
            return { success: false, attempts: this.rateLimit, provider: '' };
        }

        for (let i = 0; i < this.providers.length; i++) {
            this.incrementAttempt(to);
            const success = await this.sendWithProvider(this.providers[i], to, subject, body);
            if (success) {
                this.sentEmails.add(emailId);
                return { success: true, attempts: i + 1, provider: this.providers[i].constructor.name };
            }
        }

        return { success: false, attempts: this.providers.length, provider: '' };
    }
}
