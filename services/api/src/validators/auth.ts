/**
 * @project BilheteriaTech
 * @author Dirceu Silva de Oliveira Tech
 * @date 2026-02-12
 * @description Schemas de validação Zod para autenticação - DEPRECATED: Use DTOs em dtos/auth.dto.ts
 * @deprecated Use RegisterDTO e LoginDTO de '../dtos/auth.dto.js'
 */
import { RegisterDTO, LoginDTO } from '../dtos/auth.dto.js';

export const registerSchema = RegisterDTO;
export const loginSchema = LoginDTO;
export const adminLoginSchema = LoginDTO;
