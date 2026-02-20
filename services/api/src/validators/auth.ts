/**
 * @project BilheteriaTech
 * @author Dirceu Silva de Oliveira Tech
 * @date 2025-02-13
 * @description Esquemas de validação de requisições de autenticação
 */

import { RegisterDTO, LoginDTO } from '../dtos/auth.dto.js';

export const registerSchema = RegisterDTO;
export const loginSchema = LoginDTO;
export const adminLoginSchema = LoginDTO;
