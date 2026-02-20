/**
 * @project BilheteriaTech
 * @author Dirceu Silva de Oliveira Tech
 * @date 2025-02-13
 * @description DTOs e esquemas Zod de eventos
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
