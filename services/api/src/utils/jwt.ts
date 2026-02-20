/**
 * @project BilheteriaTech
 * @author Dirceu Silva de Oliveira Tech
 * @date 2025-02-12
 * @description Utilitários de geração e verificação de tokens JWT
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
