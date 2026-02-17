/**
 * Controller que gerencia as requisições HTTP relacionadas a pagamentos.
 * Processa pagamentos fake e recebe webhooks de confirmação de pagamento.
 * 
 * @project BilheteriaTech
 * @author Dirceu Silva de Oliveira Tech
 * @date 2026-02-15
 */
import { Request, Response } from 'express';
import { PaymentService } from '../services/payment.service.js';
import { FakePaymentDTO, WebhookDTO } from '../dtos/payment.dto.js';
import { RequestWithUser } from '../types/auth.js';
import { verifyWebhookSignature } from '../utils/webhook.js';
import { logger } from '../config/logger.js';

const paymentService = new PaymentService();

export async function fakePayment(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as RequestWithUser).user;
    if (!user) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }

    const data = FakePaymentDTO.parse(req.body);
    const result = await paymentService.processFakePayment(data.orderId, user.userId, data);
    res.json(result);
  } catch (error) {
    logger.error(error);
    if (error instanceof Error && error.name === 'ZodError') {
      res.status(400).json({ error: 'Dados inválidos' });
      return;
    }
    if (
      error instanceof Error &&
      (error.message === 'Pedido não encontrado' ||
        error.message === 'Acesso negado' ||
        error.message === 'Pedido já processado' ||
        error.message === 'Cartão inválido')
    ) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Erro ao processar pagamento' });
  }
}

export async function webhookPayment(req: Request, res: Response): Promise<void> {
  try {
    const signature = req.headers['x-signature'] as string;
    if (!signature) {
      res.status(401).json({ error: 'Assinatura não fornecida' });
      return;
    }

    const rawBody = req.body instanceof Buffer ? req.body.toString('utf8') : JSON.stringify(req.body);
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const isValid = verifyWebhookSignature(rawBody, signature);

    if (!isValid) {
      res.status(401).json({ error: 'Assinatura inválida' });
      return;
    }

    const data = WebhookDTO.parse(body);
    
    // Publica o webhook na fila RabbitMQ para processamento assíncrono.
    // A API responde rapidamente (200 OK) enquanto o processamento acontece em background.
    await paymentService.receiveWebhook(data);
    
    // Responde imediatamente - o processamento será feito assincronamente pelo worker
    res.status(200).json({ success: true, message: 'Webhook recebido e será processado' });
  } catch (error) {
    logger.error(error);
    if (error instanceof Error && error.name === 'ZodError') {
      res.status(400).json({ error: 'Dados inválidos' });
      return;
    }
    res.status(500).json({ error: 'Erro ao receber webhook' });
  }
}
