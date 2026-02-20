/**
 * @project BilheteriaTech
 * @author Dirceu Silva de Oliveira Tech
 * @date 2025-02-16
 * @description Controller de usuários para gestão de usuários
 */

import { Request, Response } from 'express';
import { UserService } from '../services/user.service.js';
import { logger } from '../config/logger.js';

const userService = new UserService();

export async function listUsers(req: Request, res: Response): Promise<void> {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: 'Erro ao listar usuários' });
  }
}
