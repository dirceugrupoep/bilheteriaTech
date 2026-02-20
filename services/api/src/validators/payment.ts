/**
 * @project BilheteriaTech
 * @author Dirceu Silva de Oliveira Tech
 * @date 2025-02-13
 * @description Esquemas de validação de requisições de pagamento
 */

import { FakePaymentDTO, WebhookDTO } from '../dtos/payment.dto.js';

export const fakePaymentSchema = FakePaymentDTO;
export const webhookSchema = WebhookDTO;
