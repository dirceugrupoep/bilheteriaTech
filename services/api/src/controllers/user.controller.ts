/**
 * @project BilheteriaTech
 * @author Dirceu Silva de Oliveira Tech
 * @date 2026-02-16
 * @description Controller responsável pelo gerenciamento de usuários do sistema, permitindo listagem de todos os usuários cadastrados (admin only).
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
