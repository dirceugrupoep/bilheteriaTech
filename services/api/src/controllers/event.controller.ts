/**
 * @project BilheteriaTech
 * @author Dirceu Silva de Oliveira Tech
 * @date 2026-02-13
 * @description Controller responsável pelo gerenciamento de eventos do sistema de bilheteria, incluindo listagem, criação, atualização e exclusão.
 */
import { Request, Response } from 'express';
import { EventService } from '../services/event.service.js';
import { CreateEventDTO, UpdateEventDTO } from '../dtos/event.dto.js';
import { logger } from '../config/logger.js';

const eventService = new EventService();

export async function listEvents(req: Request, res: Response): Promise<void> {
  try {
    const events = await eventService.getAllEvents();
    res.json(events);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: 'Erro ao listar eventos' });
  }
}

export async function getEvent(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const event = await eventService.getEventById(id);
    res.json(event);
  } catch (error) {
    logger.error(error);
    if (error instanceof Error && error.message === 'Evento não encontrado') {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Erro ao buscar evento' });
  }
}

export async function createEvent(req: Request, res: Response): Promise<void> {
  try {
    const data = CreateEventDTO.parse(req.body);
    const event = await eventService.createEvent(data);
    res.status(201).json(event);
  } catch (error) {
    logger.error(error);
    if (error instanceof Error && error.name === 'ZodError') {
      res.status(400).json({ error: 'Dados inválidos' });
      return;
    }
    res.status(500).json({ error: 'Erro ao criar evento' });
  }
}

export async function updateEvent(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const data = UpdateEventDTO.parse(req.body);
    const event = await eventService.updateEvent(id, data);
    res.json(event);
  } catch (error) {
    logger.error(error);
    if (error instanceof Error && error.name === 'ZodError') {
      res.status(400).json({ error: 'Dados inválidos' });
      return;
    }
    if (error instanceof Error && error.message === 'Evento não encontrado') {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Erro ao atualizar evento' });
  }
}

export async function deleteEvent(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await eventService.deleteEvent(id);
    res.status(204).send();
  } catch (error) {
    logger.error(error);
    if (error instanceof Error && error.message === 'Evento não encontrado') {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Erro ao deletar evento' });
  }
}
