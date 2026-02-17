/**
 * @project BilheteriaTech
 * @author Dirceu Silva de Oliveira Tech
 * @date 2026-02-17
 * @description Service com lógica de negócio para pedidos do sistema de bilheteria.
 */
import { OrderRepository } from '../repositories/order.repository.js';
import { EventRepository } from '../repositories/event.repository.js';
import { CreateOrderInput, OrderResponseDTO } from '../dtos/order.dto.js';
import { logger } from '../config/logger.js';

export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository = new OrderRepository(),
    private readonly eventRepository: EventRepository = new EventRepository()
  ) {}

  async createOrder(userId: string, data: CreateOrderInput): Promise<OrderResponseDTO> {
    try {
      // Buscar evento
      const event = await this.eventRepository.findById(data.eventId);
      if (!event) {
        throw new Error('Evento não encontrado');
      }

      // Verificar disponibilidade de tickets
      const ordersCount = await this.orderRepository.countByEventAndStatus(event.id, [
        'PENDING',
        'PAID',
      ]);

      if (ordersCount + data.quantity > event.totalTickets) {
        throw new Error('Tickets insuficientes');
      }

      // Calcular valor total
      const amountCents = event.priceCents * data.quantity;

      // Criar pedido
      const order = await this.orderRepository.create({
        ...data,
        userId,
        amountCents,
      });

      return order as OrderResponseDTO;
    } catch (error) {
      logger.error('Erro ao criar pedido:', error);
      if (
        error instanceof Error &&
        (error.message === 'Evento não encontrado' || error.message === 'Tickets insuficientes')
      ) {
        throw error;
      }
      throw new Error('Erro ao criar pedido');
    }
  }

  async getOrderById(id: string, userId?: string, userRole?: string): Promise<OrderResponseDTO> {
    try {
      const order = await this.orderRepository.findById(id);
      if (!order) {
        throw new Error('Pedido não encontrado');
      }

      // Verificar permissão
      if (userRole !== 'ADMIN' && order.userId !== userId) {
        throw new Error('Acesso negado');
      }

      return order as OrderResponseDTO;
    } catch (error) {
      logger.error('Erro ao buscar pedido:', error);
      if (
        error instanceof Error &&
        (error.message === 'Pedido não encontrado' || error.message === 'Acesso negado')
      ) {
        throw error;
      }
      throw new Error('Erro ao buscar pedido');
    }
  }

  async getUserOrders(userId: string): Promise<OrderResponseDTO[]> {
    try {
      return (await this.orderRepository.findByUserId(userId)) as OrderResponseDTO[];
    } catch (error) {
      logger.error('Erro ao listar pedidos do usuário:', error);
      throw new Error('Erro ao listar pedidos');
    }
  }

  async getAllOrders(): Promise<OrderResponseDTO[]> {
    try {
      return (await this.orderRepository.findAll()) as OrderResponseDTO[];
    } catch (error) {
      logger.error('Erro ao listar todos os pedidos:', error);
      throw new Error('Erro ao listar pedidos');
    }
  }

  async updateOrderStatus(id: string, status: 'PENDING' | 'PAID' | 'CANCELLED'): Promise<void> {
    try {
      await this.orderRepository.updateStatus(id, status);
    } catch (error) {
      logger.error('Erro ao atualizar status do pedido:', error);
      throw new Error('Erro ao atualizar status do pedido');
    }
  }
}
