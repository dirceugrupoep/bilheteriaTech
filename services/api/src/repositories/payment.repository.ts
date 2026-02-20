/**
 * @project BilheteriaTech
 * @author Dirceu Silva de Oliveira Tech
 * @date 2025-02-14
 * @description Repositório de pagamentos para operações de banco de dados
 */

import { PrismaClient, Payment } from '@prisma/client';
import { prisma } from '../config/database.js';

export class PaymentRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  async create(data: {
    orderId: string;
    provider: string;
    status: 'PENDING' | 'PAID' | 'FAILED';
    payload?: unknown;
  }): Promise<Payment> {
    return this.db.payment.create({
      data: {
        orderId: data.orderId,
        provider: data.provider,
        status: data.status,
        payload: data.payload as object,
      },
    });
  }

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
