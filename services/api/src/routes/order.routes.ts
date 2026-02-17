/**
 * @project BilheteriaTech
 * @author Dirceu Silva de Oliveira Tech
 * @date 2026-02-14
 * @description Rotas para gerenciamento de pedidos do sistema de bilheteria, permitindo criação de pedidos e consulta para clientes e administradores.
 */
import { Router } from 'express';
import {
  createOrder,
  getOrder,
  getMyOrders,
  listOrders,
} from '../controllers/order.controller.js';
import { authenticate, authenticateAdmin } from '../middlewares/auth.js';

const router = Router();

router.post('/', authenticate, createOrder);
router.get('/me/orders', authenticate, getMyOrders);
router.get('/admin/orders', authenticateAdmin, listOrders);
router.get('/:id', authenticate, getOrder);

export default router;
