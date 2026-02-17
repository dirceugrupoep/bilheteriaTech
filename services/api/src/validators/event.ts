/**
 * @project BilheteriaTech
 * @author Dirceu Silva de Oliveira Tech
 * @date 2026-02-13
 * @description Schemas de validação Zod para eventos - DEPRECATED: Use DTOs em dtos/event.dto.ts
 * @deprecated Use CreateEventDTO e UpdateEventDTO de '../dtos/event.dto.js'
 */
import { CreateEventDTO, UpdateEventDTO } from '../dtos/event.dto.js';

export const createEventSchema = CreateEventDTO;
export const updateEventSchema = UpdateEventDTO;
