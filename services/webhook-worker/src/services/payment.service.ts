/**
 * Service que processa webhooks recebidos da fila RabbitMQ.
 * Atualiza o status de pagamentos e pedidos no banco de dados.
 * 
 * @project BilheteriaTech
 * @author Dirceu Silva de Oliveira Tech
 * @date 2026-02-17
 */
import { PaymentRepository } from '../repositories/payment.repository.js';
import { OrderRepository } from '../repositories/order.repository.js';
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport:
    process.env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
          },
        }
      : undefined,
});

interface WebhookInput {
  orderId: string;
  paymentId: string;
  status: 'PAID' | 'FAILED';
}

export class PaymentService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly orderRepository: OrderRepository
  ) {}

  async processWebhook(data: WebhookInput): Promise<void> {
    try {
      const payment = await this.paymentRepository.findById(data.paymentId);
      if (!payment) {
        throw new Error('Pagamento não encontrado');
      }

      if (data.status === 'PAID') {
        // Atualiza o pagamento e o pedido em paralelo para melhor performance
        await Promise.all([
          this.paymentRepository.updateStatus(payment.id, 'PAID'),
          this.orderRepository.updateStatus(payment.orderId, 'PAID'),
        ]);

        logger.info(`Pedido ${payment.orderId} marcado como PAID`);
      } else if (data.status === 'FAILED') {
        await this.paymentRepository.updateStatus(payment.id, 'FAILED');
        logger.info(`Pagamento ${payment.id} marcado como FAILED`);
      }
    } catch (error) {
      logger.error('Erro ao processar webhook:', error);
      throw error;
    }
  }
}
