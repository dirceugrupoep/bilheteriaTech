/**
 * @project BilheteriaTech
 * @author Dirceu Silva de Oliveira Tech
 * @date 2025-02-12
 * @description Assinatura e verificação de webhooks
 */

import crypto from 'crypto';
import { env } from '../config/env.js';

export function signWebhook(payload: string): string {
  return crypto
    .createHmac('sha256', env.WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');
}

export function verifyWebhookSignature(
  payload: string,
  signature: string
): boolean {
  const expectedSignature = signWebhook(payload);
  if (signature.length !== expectedSignature.length) {
    return false;
  }
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
