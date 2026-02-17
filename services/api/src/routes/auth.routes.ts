/**
 * @project BilheteriaTech
 * @author Dirceu Silva de Oliveira Tech
 * @date 2026-02-12
 * @description Rotas de autenticação do sistema de bilheteria, incluindo registro, login de clientes e login de administradores com rate limiting.
 */
import { Router } from 'express';
import { register, login, adminLogin } from '../controllers/auth.controller.js';
import rateLimit from 'express-rate-limit';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas
  message: 'Muitas tentativas de login. Tente novamente mais tarde.',
});

router.post('/register', register);
router.post('/login', loginLimiter, login);
router.post('/admin/login', loginLimiter, adminLogin);

export default router;
