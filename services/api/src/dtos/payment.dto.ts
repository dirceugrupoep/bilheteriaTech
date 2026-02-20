/**
 * @project BilheteriaTech
 * @author Dirceu Silva de Oliveira Tech
 * @date 2026-02-17
 * @description DTOs (Data Transfer Objects) para pagamentos do sistema de bilheteria.
 */
import { z } from 'zod';

export const FakePaymentDTO = z.object({
  orderId: z.string().min(1),
  cardNumber: z.string().min(13).max(19),
  cardName: z.string().min(2),
  expMonth: z.number().int().min(1).max(12),
  expYear: z.number().int().min(2024),
  cvv: z.string().regex(/^\d{3,4}$/),
});

export const WebhookDTO = z.object({
  orderId: z.string().min(1),
  paymentId: z.string().min(1),
  status: z.enum(['PAID', 'FAILED']),
});

export type FakePaymentInput = z.infer<typeof FakePaymentDTO>;
export type WebhookInput = z.infer<typeof WebhookDTO>;

export interface PaymentResponseDTO {
  paymentId: string;
  status: 'PENDING' | 'PAID' | 'FAILED';
  message: string;
}
