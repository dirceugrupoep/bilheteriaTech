/**
 * @project BilheteriaTech
 * @author Dirceu Silva de Oliveira Tech
 * @date 2026-02-14
 * @description Utilitários para geração e validação de tokens JWT do sistema de bilheteria, com suporte para tokens de usuários e administradores.
 */
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { JWTPayload } from '../types/auth.js';

export function generateToken(payload: JWTPayload, isAdmin = false): string {
  const secret = isAdmin ? env.ADMIN_JWT_SECRET : env.JWT_SECRET;
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

export function verifyToken(token: string, isAdmin = false): JWTPayload {
  const secret = isAdmin ? env.ADMIN_JWT_SECRET : env.JWT_SECRET;
  return jwt.verify(token, secret) as JWTPayload;
}
