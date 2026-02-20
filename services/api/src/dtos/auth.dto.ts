/**
 * @project BilheteriaTech
 * @author Dirceu Silva de Oliveira Tech
 * @date 2025-02-13
 * @description DTOs e esquemas Zod de autenticação
 */

import { z } from 'zod';

export const RegisterDTO = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6),
});

export const LoginDTO = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type RegisterInput = z.infer<typeof RegisterDTO>;
export type LoginInput = z.infer<typeof LoginDTO>;

export interface AuthResponseDTO {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'USER' | 'ADMIN';
  };
}
