import { EmailService } from './Email_service';

(async () => {
    const emailService = new EmailService();

    const status1 = await emailService.sendEmail('test1@gmail.com', 'Hello', 'This is test email 1.');
    console.log(status1);

    const status2 = await emailService.sendEmail('test2@gmail.com', 'Hii', 'This is test email 2.');
    console.log(status2);

    const status3 = await emailService.sendEmail('test3@gmail.com', 'Hello there', 'This is test email 3.');
    console.log(status3);
})();
