// src/index.ts
import { EmailService } from './Email_service';

(async () => {
    const emailService = new EmailService();

    const status1 = await emailService.sendEmail('test1@example.com', 'Hello', 'This is a test email.');
    console.log(status1);

    const status2 = await emailService.sendEmail('test1@example.com', 'Hello', 'This is a test email.');
    console.log(status2);

    const status3 = await emailService.sendEmail('test2@example.com', 'Hello', 'This is another test email.');
    console.log(status3);
})();
