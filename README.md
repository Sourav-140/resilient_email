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

