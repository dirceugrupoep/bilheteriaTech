/**
 * @project BilheteriaTech
 * @author Dirceu Silva de Oliveira Tech
 * @date 2025-02-14
 * @description Repositório de eventos para operações de banco de dados
 */

import { PrismaClient, Event } from '@prisma/client';
import { prisma } from '../config/database.js';
import { CreateEventInput, UpdateEventInput } from '../dtos/event.dto.js';

export class EventRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  async findAll(): Promise<Event[]> {
    return this.db.event.findMany({
      orderBy: { date: 'asc' },
    });
  }

  async findById(id: string): Promise<Event | null> {
    return this.db.event.findUnique({
      where: { id },
    });
  }

  async create(data: CreateEventInput): Promise<Event> {
    return this.db.event.create({
      data: {
        ...data,
        date: new Date(data.date),
      },
    });
  }

  async update(id: string, data: UpdateEventInput): Promise<Event> {
    const updateData: {
      title?: string;
      description?: string;
      date?: Date;
      priceCents?: number;
      totalTickets?: number;
    } = {};

    if (data.title) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.date) updateData.date = new Date(data.date);
    if (data.priceCents) updateData.priceCents = data.priceCents;
    if (data.totalTickets) updateData.totalTickets = data.totalTickets;

    return this.db.event.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string): Promise<void> {
    await this.db.event.delete({
      where: { id },
    });
  }
}
