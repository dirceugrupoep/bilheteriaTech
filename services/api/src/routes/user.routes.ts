/**
 * @project BilheteriaTech
 * @author Dirceu Silva de Oliveira Tech
 * @date 2026-02-16
 * @description Rotas para gerenciamento de usuários do sistema de bilheteria, permitindo listagem de todos os usuários cadastrados (admin only).
 */
import { Router } from 'express';
import { listUsers } from '../controllers/user.controller.js';
import { authenticateAdmin } from '../middlewares/auth.js';

const router = Router();

router.get('/', authenticateAdmin, listUsers);

export default router;
