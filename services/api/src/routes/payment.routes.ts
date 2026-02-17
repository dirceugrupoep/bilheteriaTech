/**
 * @project BilheteriaTech
 * @author Dirceu Silva de Oliveira Tech
 * @date 2026-02-15
 * @description Rotas para processamento de pagamentos fake e recebimento de webhooks de confirmação de pagamento do sistema de bilheteria.
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
