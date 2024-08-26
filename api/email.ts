import { VercelRequest, VercelResponse } from '@vercel/node';
import { EmailService } from '../src/Email_service';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method === 'POST') {
        const { to, subject, body } = req.body;

        const emailService = new EmailService();
        const result = await emailService.sendEmail(to, subject, body);

        res.status(200).json(result);
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
