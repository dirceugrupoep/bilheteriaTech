/**
 * Service que contém a lógica de negócio para processamento de pagamentos.
 * Gerencia pagamentos fake, recebimento de webhooks e publicação de mensagens na fila.
 * 
 * @project BilheteriaTech
 * @author Dirceu Silva de Oliveira Tech
 * @date 2026-02-17
 */
import axios from 'axios';
import { PaymentRepository } from '../repositories/payment.repository.js';
import { OrderRepository } from '../repositories/order.repository.js';
import { FakePaymentInput, WebhookInput, PaymentResponseDTO } from '../dtos/payment.dto.js';
import { env } from '../config/env.js';
import { signWebhook } from '../utils/webhook.js';
import { logger } from '../config/logger.js';
import { createQueueService, QueueService } from './queue.service.js';

export class PaymentService {
  private readonly queueService: QueueService;

  constructor(
    private readonly paymentRepository: PaymentRepository = new PaymentRepository(),
    private readonly orderRepository: OrderRepository = new OrderRepository(),
    queueService?: QueueService
  ) {
    this.queueService = queueService || createQueueService();
  }

  async processFakePayment(orderId: string, userId: string, cardData: FakePaymentInput): Promise<PaymentResponseDTO> {
    try {
      // Verificar se o pedido existe e pertence ao usuário
      const order = await this.orderRepository.findById(orderId);
      if (!order) {
        throw new Error('Pedido não encontrado');
      }

      if (order.userId !== userId) {
        throw new Error('Acesso negado');
      }

      if (order.status !== 'PENDING') {
        throw new Error('Pedido já processado');
      }

      // Validar cartão fake (deve começar com 4242)
      const isValidCard = cardData.cardNumber.startsWith('4242');

      // Criar payment
      const payment = await this.paymentRepository.create({
        orderId: order.id,
        provider: 'FAKEPAY',
        status: isValidCard ? 'PENDING' : 'FAILED',
        payload: {
          cardNumber: cardData.cardNumber.slice(-4),
          cardName: cardData.cardName,
          expMonth: cardData.expMonth,
          expYear: cardData.expYear,
        },
      });

      if (!isValidCard) {
        throw new Error('Cartão inválido');
      }

      // Chamar serviço mock para disparar webhook
      try {
        const webhookPayload = {
          orderId: order.id,
          paymentId: payment.id,
          status: 'PAID' as const,
        };

        const payloadString = JSON.stringify(webhookPayload);
        const signature = signWebhook(payloadString);

        await axios.post(`${env.PAYMENT_MOCK_URL}/webhook/trigger`, {
          ...webhookPayload,
          signature,
          webhookUrl: `${env.API_BASE_URL}/webhooks/payment`,
        });

        logger.info(`Webhook disparado para pedido ${order.id}`);
      } catch (error) {
        logger.error('Erro ao disparar webhook:', error);
        // Não falhar a requisição, o webhook pode ser processado depois
      }

      return {
        paymentId: payment.id,
        status: payment.status,
        message: 'Pagamento processado',
      };
    } catch (error) {
      logger.error('Erro ao processar pagamento:', error);
      if (
        error instanceof Error &&
        (error.message === 'Pedido não encontrado' ||
          error.message === 'Acesso negado' ||
          error.message === 'Pedido já processado' ||
          error.message === 'Cartão inválido')
      ) {
        throw error;
      }
      throw new Error('Erro ao processar pagamento');
    }
  }

  /**
   * Recebe um webhook e publica na fila RabbitMQ para processamento assíncrono.
   * Este método retorna rapidamente após publicar na fila, não bloqueando a resposta HTTP.
   */
  async receiveWebhook(data: WebhookInput): Promise<void> {
    try {
      await this.queueService.publishWebhook(data);
      logger.info('Webhook recebido e publicado no RabbitMQ', { paymentId: data.paymentId });
    } catch (error) {
      logger.error('Erro ao publicar webhook no RabbitMQ:', error);
      throw new Error('Erro ao processar webhook');
    }
  }

  /**
   * Processa um webhook recebido da fila RabbitMQ.
   * Este método é chamado pelo worker que consome mensagens da fila.
   * Atualiza o status do pagamento e do pedido no banco de dados.
   */
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
      if (error instanceof Error && error.message === 'Pagamento não encontrado') {
        throw error;
      }
      throw new Error('Erro ao processar webhook');
    }
  }

  /**
   * Fecha as conexões com os serviços externos (RabbitMQ).
   * Deve ser chamado durante o graceful shutdown do servidor.
   */
  async close(): Promise<void> {
    await this.queueService.close();
  }
}
