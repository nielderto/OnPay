import crypto from 'crypto';

export function createSignature(
  method: string,
  path: string,
  body: string,
  timestamp: string,
  secret: string
): string {
  const message = `${method}${path}${body}${timestamp}`;
  return crypto
    .createHmac('sha256', secret)
    .update(message)
    .digest('hex');
} 