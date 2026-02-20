/**
 * @project BilheteriaTech
 * @author Dirceu Silva de Oliveira Tech
 * @date 2025-02-13
 * @description DTOs e esquemas Zod de pedidos
 */

import { z } from 'zod';

export const CreateOrderDTO = z.object({
  eventId: z.string().min(1),
  quantity: z.number().int().positive().max(10),
});

export type CreateOrderInput = z.infer<typeof CreateOrderDTO>;

export interface OrderResponseDTO {
  id: string;
  userId: string;
  eventId: string;
  quantity: number;
  amountCents: number;
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  createdAt: Date;
  event?: {
    id: string;
    title: string;
    date: Date;
    priceCents: number;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
  payments?: Array<{
    id: string;
    status: string;
  }>;
}
