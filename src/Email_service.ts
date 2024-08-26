import { EmailProvider, MockEmailProvider1, MockEmailProvider2 } from './Mock_email_providers';

interface EmailStatus {
    success: boolean;
    attempts: number;
    provider: string;
}

export class EmailService {
    private providers: EmailProvider[];
    private max_retries: number;
    private rate_limit: number;
    private attempt_counts: Map<string, number>;
    private sent_emails: Set<string>;
    private failure_counts: Map<string, number>;
    private circuit_open: Map<string, boolean>;

    constructor(max_retries: number = 3, rate_limit: number = 5) {
        this.providers = [new MockEmailProvider1(), new MockEmailProvider2()];
        this.max_retries = max_retries;
        this.rate_limit = rate_limit;
        this.attempt_counts = new Map<string, number>();
        this.sent_emails = new Set<string>();
        this.failure_counts = new Map<string, number>();
        this.circuit_open = new Map<string, boolean>();
    }

    private async sendWithProvider(
        provider: EmailProvider,
        to: string,
        subject: string,
        body: string,
        attempt: number = 0
    ): Promise<boolean> {
        const providerName = provider.constructor.name;
        
        if (this.circuit_open.get(providerName)) {
            console.log(`Circuit open for ${providerName}`);
            return false;
        }

        try {
            if (await provider.sendEmail(to, subject, body)) {
                this.failure_counts.set(providerName, 0);   // Reset the failures count on success
                return true;
            }
            throw new Error('Provider failed to send an email');
        } catch (error) {
            const failureCount = this.failure_counts.get(providerName) || 0;
            this.failure_counts.set(providerName, failureCount + 1);

            if (this.shouldOpenCircuit(provider)) {
                this.circuit_open.set(providerName, true);
                console.log(`Circuit opened for ${providerName}`);
                setTimeout(() => this.circuit_open.set(providerName, false), 60000);    // Reopen the circuit after one minute
            }

            if (attempt < this.max_retries) {
                await this.delay((2 ** attempt) * 100);     // The exponential backoff
                return this.sendWithProvider(provider, to, subject, body, attempt + 1);
            }
            return false;
        }
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    private incrementAttempt(to: string): void {
        this.attempt_counts.set(to, (this.attempt_counts.get(to) || 0) + 1);
    }

    private checkRateLimit(to: string): boolean {
        return (this.attempt_counts.get(to) || 0) < this.rate_limit;
    }

    private shouldOpenCircuit(provider: EmailProvider): boolean {
        const failureCount = this.failure_counts.get(provider.constructor.name) || 0;
        return failureCount >= this.max_retries;
    }

    public async sendEmail(
        to: string,
        subject: string,
        body: string
    ): Promise<EmailStatus> {
        const emailId = `${to}-${subject}-${body}`;
        if (this.sent_emails.has(emailId)) {
            return { success: true, attempts: 0, provider: 'Idempotency' };
        }

        if (!this.checkRateLimit(to)) {
            return { success: false, attempts: this.rate_limit, provider: '' };
        }

        for (let i = 0; i < this.providers.length; i++) {
            this.incrementAttempt(to);
            const success = await this.sendWithProvider(this.providers[i], to, subject, body);
            if (success) {
                this.sent_emails.add(emailId);
                return { success: true, attempts: i + 1, provider: this.providers[i].constructor.name };
            }
        }

        return { success: false, attempts: this.providers.length, provider: '' };
    }
}
