/**
 * Repository que abstrai o acesso aos dados de pagamentos no banco de dados.
 * Contém os métodos necessários para o processamento de webhooks no worker.
 * 
 * @project BilheteriaTech
 * @author Dirceu Silva de Oliveira Tech
 * @date 2026-02-17
 */
import { PrismaClient, Payment } from '@prisma/client';

export class PaymentRepository {
  constructor(private readonly db: PrismaClient) {}

  async findById(id: string): Promise<Payment | null> {
    return this.db.payment.findUnique({
      where: { id },
      include: { order: true },
    });
  }

  async updateStatus(id: string, status: 'PENDING' | 'PAID' | 'FAILED'): Promise<Payment> {
    return this.db.payment.update({
      where: { id },
      data: { status },
    });
  }
}
