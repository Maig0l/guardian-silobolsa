import crypto from 'crypto';
import { env } from '../config/env.js';

/**
 * Genera una api_key determinista a partir de la mac_address del sensor.
 * Usa HMAC-SHA256 con el secreto definido en API_KEY_SECRET.
 * Mismo mac_address → siempre la misma api_key.
 */
export function generateApiKey(macAddress: string): string {
  const normalized = macAddress.toLowerCase().replace(/[^a-f0-9]/g, '');
  return crypto
    .createHmac('sha256', env.API_KEY_SECRET)
    .update(normalized)
    .digest('hex');
}
