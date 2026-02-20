/**
 * @project BilheteriaTech
 * @author Dirceu Silva de Oliveira Tech
 * @date 2025-02-16
 * @description Rotas de pagamento e endpoint de webhook
 */

import { Router } from 'express';
import { fakePayment, webhookPayment } from '../controllers/payment.controller.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.post('/fake', authenticate, fakePayment);

const webhookRouter = Router();
webhookRouter.post('/', webhookPayment);

export default router;
export { webhookRouter };
