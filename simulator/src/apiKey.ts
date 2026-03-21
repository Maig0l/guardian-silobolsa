import crypto from 'crypto';
import { config } from './config.js';

/**
 * Replica exacta de backend/src/utils/apiKey.ts
 * Genera la api_key HMAC-SHA256 desde la mac_address.
 * Como es determinista, el simulador no necesita hacer handshake.
 */
export function generateApiKey(macAddress: string): string {
  const normalized = macAddress.toLowerCase().replace(/[^a-f0-9]/g, '');
  return crypto
    .createHmac('sha256', config.apiKeySecret)
    .update(normalized)
    .digest('hex');
}
