/**
 * @project BilheteriaTech
 * @author Dirceu Silva de Oliveira Tech
 * @date 2025-02-15
 * @description Serviço de eventos para lógica de negócio
 */

import { EventRepository } from '../repositories/event.repository.js';
import { CreateEventInput, UpdateEventInput } from '../dtos/event.dto.js';
import { logger } from '../config/logger.js';

export class EventService {
  constructor(private readonly eventRepository: EventRepository = new EventRepository()) {}

  async getAllEvents() {
    try {
      return await this.eventRepository.findAll();
    } catch (error) {
      logger.error('Erro ao buscar eventos:', error);
      throw new Error('Erro ao listar eventos');
    }
  }

  async getEventById(id: string) {
    try {
      const event = await this.eventRepository.findById(id);
      if (!event) {
        throw new Error('Evento não encontrado');
      }
      return event;
    } catch (error) {
      logger.error('Erro ao buscar evento:', error);
      if (error instanceof Error && error.message === 'Evento não encontrado') {
        throw error;
      }
      throw new Error('Erro ao buscar evento');
    }
  }

  async createEvent(data: CreateEventInput) {
    try {
      return await this.eventRepository.create(data);
    } catch (error) {
      logger.error('Erro ao criar evento:', error);
      throw new Error('Erro ao criar evento');
    }
  }

  async updateEvent(id: string, data: UpdateEventInput) {
    try {
      const existingEvent = await this.eventRepository.findById(id);
      if (!existingEvent) {
        throw new Error('Evento não encontrado');
      }
      return await this.eventRepository.update(id, data);
    } catch (error) {
      logger.error('Erro ao atualizar evento:', error);
      if (error instanceof Error && error.message === 'Evento não encontrado') {
        throw error;
      }
      throw new Error('Erro ao atualizar evento');
    }
  }

  async deleteEvent(id: string) {
    try {
      const existingEvent = await this.eventRepository.findById(id);
      if (!existingEvent) {
        throw new Error('Evento não encontrado');
      }
      await this.eventRepository.delete(id);
    } catch (error) {
      logger.error('Erro ao deletar evento:', error);
      if (error instanceof Error && error.message === 'Evento não encontrado') {
        throw error;
      }
      throw new Error('Erro ao deletar evento');
    }
  }
}
