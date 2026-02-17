/**
 * @project BilheteriaTech
 * @author Dirceu Silva de Oliveira Tech
 * @date 2026-02-12
 * @description Controller responsável pela autenticação do sistema, incluindo registro de clientes, login de clientes e login de administradores.
 */
import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';
import { RegisterDTO, LoginDTO } from '../dtos/auth.dto.js';
import { logger } from '../config/logger.js';

const authService = new AuthService();

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const data = RegisterDTO.parse(req.body);
    const result = await authService.register(data);
    res.status(201).json(result);
  } catch (error) {
    logger.error(error);
    if (error instanceof Error && error.name === 'ZodError') {
      res.status(400).json({ error: 'Dados inválidos' });
      return;
    }
    if (error instanceof Error && error.message === 'Email já cadastrado') {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const data = LoginDTO.parse(req.body);
    const result = await authService.login(data, false);
    res.json(result);
  } catch (error) {
    logger.error(error);
    if (error instanceof Error && error.name === 'ZodError') {
      res.status(400).json({ error: 'Dados inválidos' });
      return;
    }
    if (error instanceof Error && error.message === 'Credenciais inválidas') {
      res.status(401).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
}

export async function adminLogin(req: Request, res: Response): Promise<void> {
  try {
    const data = LoginDTO.parse(req.body);
    const result = await authService.login(data, true);
    res.json(result);
  } catch (error) {
    logger.error(error);
    if (error instanceof Error && error.name === 'ZodError') {
      res.status(400).json({ error: 'Dados inválidos' });
      return;
    }
    if (error instanceof Error && error.message === 'Credenciais inválidas') {
      res.status(401).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
}
