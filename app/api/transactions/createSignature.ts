export function createSignature(
  method: string,
  path: string,
  body: string,
  timestamp: string,
  secret: string
): string {
  const message = `${method}${path}${body}${timestamp}`;
  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(message);
  return hmac.digest('hex');
} 