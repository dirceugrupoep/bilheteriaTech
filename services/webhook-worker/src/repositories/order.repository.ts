/**
 * Repository que abstrai o acesso aos dados de pedidos no banco de dados.
 * Contém os métodos necessários para o processamento de webhooks no worker.
 * 
 * @project BilheteriaTech
 * @author Dirceu Silva de Oliveira Tech
 * @date 2026-02-17
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
