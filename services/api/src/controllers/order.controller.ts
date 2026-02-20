/**
 * @project BilheteriaTech
 * @author Dirceu Silva de Oliveira Tech
 * @date 2025-02-16
 * @description Controller de pedidos para compra de ingressos
 */

import { Request, Response } from 'express';
import { OrderService } from '../services/order.service.js';
import { CreateOrderDTO } from '../dtos/order.dto.js';
import { RequestWithUser } from '../types/auth.js';
import { logger } from '../config/logger.js';

const orderService = new OrderService();

export async function createOrder(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as RequestWithUser).user;
    if (!user) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }

    const data = CreateOrderDTO.parse(req.body);
    const order = await orderService.createOrder(user.userId, data);
    res.status(201).json(order);
  } catch (error) {
    logger.error(error);
    if (error instanceof Error && error.name === 'ZodError') {
      res.status(400).json({ error: 'Dados inválidos' });
      return;
    }
    if (
      error instanceof Error &&
      (error.message === 'Evento não encontrado' || error.message === 'Tickets insuficientes')
    ) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Erro ao criar pedido' });
  }
}

export async function getOrder(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const user = (req as RequestWithUser).user;

    const order = await orderService.getOrderById(id, user?.userId, user?.role);
    res.json(order);
  } catch (error) {
    logger.error(error);
    if (error instanceof Error && error.message === 'Pedido não encontrado') {
      res.status(404).json({ error: error.message });
      return;
    }
    if (error instanceof Error && error.message === 'Acesso negado') {
      res.status(403).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Erro ao buscar pedido' });
  }
}

export async function getMyOrders(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as RequestWithUser).user;
    if (!user) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }

    const orders = await orderService.getUserOrders(user.userId);
    res.json(orders);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: 'Erro ao listar pedidos' });
  }
}

export async function listOrders(req: Request, res: Response): Promise<void> {
  try {
    const orders = await orderService.getAllOrders();
    res.json(orders);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: 'Erro ao listar pedidos' });
  }
}
