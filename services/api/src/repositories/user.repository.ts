/**
 * @project BilheteriaTech
 * @author Dirceu Silva de Oliveira Tech
 * @date 2025-02-14
 * @description Repositório de usuários para operações de banco de dados
 */

import { PrismaClient, User } from '@prisma/client';
import { prisma } from '../config/database.js';

export class UserRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.db.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.db.user.findUnique({
      where: { id },
    });
  }

  async create(data: {
    name: string;
    email: string;
    passwordHash: string;
    role?: 'USER' | 'ADMIN';
  }): Promise<User> {
    return this.db.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash,
        role: data.role || 'USER',
      },
    });
  }

  async findAll(): Promise<Omit<User, 'passwordHash'>[]> {
    return this.db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
