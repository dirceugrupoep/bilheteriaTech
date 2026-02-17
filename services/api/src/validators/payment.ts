/**
 * @project BilheteriaTech
 * @author Dirceu Silva de Oliveira Tech
 * @date 2026-02-15
 * @description Schemas de validação Zod para pagamentos - DEPRECATED: Use DTOs em dtos/payment.dto.ts
 * @deprecated Use FakePaymentDTO e WebhookDTO de '../dtos/payment.dto.js'
 */
import { FakePaymentDTO, WebhookDTO } from '../dtos/payment.dto.js';

export const fakePaymentSchema = FakePaymentDTO;
export const webhookSchema = WebhookDTO;
