/**
 * @project BilheteriaTech
 * @author Dirceu Silva de Oliveira Tech
 * @date 2025-02-19
 * @description Repositório de pedidos do webhook worker
 */

import { PrismaClient, Order } from '@prisma/client';

export class OrderRepository {
  constructor(private readonly db: PrismaClient) {}

  async updateStatus(id: string, status: 'PENDING' | 'PAID' | 'CANCELLED'): Promise<Order> {
    return this.db.order.update({
      where: { id },
      data: { status },
    });
  }
}
