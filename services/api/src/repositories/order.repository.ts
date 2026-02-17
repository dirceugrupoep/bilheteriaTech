/**
 * @project BilheteriaTech
 * @author Dirceu Silva de Oliveira Tech
 * @date 2026-02-17
 * @description Repository para abstrair acesso aos dados de pedidos no banco de dados.
 */
import { PrismaClient, Order } from '@prisma/client';
import { prisma } from '../config/database.js';
import { CreateOrderInput } from '../dtos/order.dto.js';

export class OrderRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  async create(data: CreateOrderInput & { userId: string; amountCents: number }): Promise<Order> {
    return this.db.order.create({
      data: {
        userId: data.userId,
        eventId: data.eventId,
        quantity: data.quantity,
        amountCents: data.amountCents,
        status: 'PENDING',
      },
      include: {
        event: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findById(id: string): Promise<Order | null> {
    return this.db.order.findUnique({
      where: { id },
      include: {
        event: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        payments: true,
      },
    });
  }

  async findByUserId(userId: string): Promise<Order[]> {
    return this.db.order.findMany({
      where: { userId },
      include: {
        event: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAll(): Promise<Order[]> {
    return this.db.order.findMany({
      include: {
        event: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async countByEventAndStatus(eventId: string, statuses: string[]): Promise<number> {
    return this.db.order.count({
      where: {
        eventId,
        status: { in: statuses as ('PENDING' | 'PAID' | 'CANCELLED')[] },
      },
    });
  }

  async updateStatus(id: string, status: 'PENDING' | 'PAID' | 'CANCELLED'): Promise<Order> {
    return this.db.order.update({
      where: { id },
      data: { status },
    });
  }
}
