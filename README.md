# Resilient Email Sending Service

## Overview.

TypeScript is used to construct a resilient email sending service in this project. The service makes use of two imitation email providers and offers features such as retry logic with exponential backoff, idempotency, a circuit breaker, and rate limiting.

## Features.

- **Retry Mechanism**: If the email fails, it will be sent again with exponential backoff.
- **Fallback Between Providers**: If one provider fails, the service will try to deliver the email through the next available provider.
- **Idempotency**: Prevents multiple email sends with the same content.
- **Rate Limiting**: Restricts the amount of attempts to send emails to a specific recipient.
- **Circuit Breaker**: Opens the circuit for a provider if it fails many times, blocking further attempts with that provider for a specific period of time.

## Assumptions.

- The email providers are mock up implementations used for demonstrative purposes.
- The rate limits is set per recipient, whereas the circuit breaker is operated by the provider.
- The maximum number of retries and the rate limit can be configured when the 'EmailService' class is defined.

## Setup instructions

1. Clone the repository:

 git clone https://github.com/your-repo/email-service.git
 cd email-service

2. Install Dependencies:

 npm install

3. Run Unit Tests:

 npm test
 
4. Using the Service:

import { EmailService } from './src/EmailService';

const emailService = new EmailService();
emailService.sendEmail('recipient@example.com', 'Subject', 'Email body');


## Testing

Unit tests are provided to verify the functionality of the EmailService. The tests cover:

- Successful email sending
- Retry logic and exponential backoff
- Fallback between providers
- Idempotency
- Circuit breaker behavior
- Rate limiting

<img width="1440" alt="Screenshot 2024-08-27 at 2 21 08 AM" src="https://github.com/user-attachments/assets/b830fdcd-b444-421b-b81b-f9ca60a1c124">

<img width="1440" alt="Screenshot 2024-08-27 at 2 21 15 AM" src="https://github.com/user-attachments/assets/4ff06dd7-527e-4cee-981b-59143f4e4583">

