/**
 * @project BilheteriaTech
 * @author Dirceu Silva de Oliveira Tech
 * @date 2026-02-13
 * @description Rotas para gerenciamento de eventos do sistema de bilheteria, com endpoints públicos para listagem e protegidos para CRUD (admin).
 */
import { Router } from 'express';
import {
  listEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../controllers/event.controller.js';
import { authenticateAdmin } from '../middlewares/auth.js';

const router = Router();

router.get('/', listEvents);
router.get('/:id', getEvent);
router.post('/', authenticateAdmin, createEvent);
router.put('/:id', authenticateAdmin, updateEvent);
router.delete('/:id', authenticateAdmin, deleteEvent);

export default router;
