/**
 * @project BilheteriaTech
 * @author Dirceu Silva de Oliveira Tech
 * @date 2026-02-13
 * @description Middlewares de autenticação do sistema de bilheteria, validando tokens JWT para usuários comuns e administradores.
 */
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';
import { RequestWithUser } from '../types/auth.js';

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Token não fornecido' });
      return;
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token, false);
    (req as RequestWithUser).user = payload;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
}

export function authenticateAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Token não fornecido' });
      return;
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token, true);
    
    if (payload.role !== 'ADMIN') {
      res.status(403).json({ error: 'Acesso negado' });
      return;
    }

    (req as RequestWithUser).user = payload;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
}
