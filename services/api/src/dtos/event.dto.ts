/**
 * @project BilheteriaTech
 * @author Dirceu Silva de Oliveira Tech
 * @date 2026-02-17
 * @description DTOs (Data Transfer Objects) para eventos do sistema de bilheteria.
 */
import { z } from 'zod';

export const CreateEventDTO = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  date: z.string().datetime(),
  priceCents: z.number().int().positive(),
  totalTickets: z.number().int().positive(),
});

export const UpdateEventDTO = CreateEventDTO.partial();

export type CreateEventInput = z.infer<typeof CreateEventDTO>;
export type UpdateEventInput = z.infer<typeof UpdateEventDTO>;
