/**
 * @project BilheteriaTech
 * @author Dirceu Silva de Oliveira Tech
 * @date 2025-02-16
 * @description Rotas de usuários para gestão de usuários
 */

import { Router } from 'express';
import { listUsers } from '../controllers/user.controller.js';
import { authenticateAdmin } from '../middlewares/auth.js';

const router = Router();

router.get('/', authenticateAdmin, listUsers);

export default router;
