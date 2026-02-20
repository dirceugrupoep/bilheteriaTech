/**
 * @project BilheteriaTech
 * @author Dirceu Silva de Oliveira Tech
 * @date 2025-02-17
 * @description Ponto de entrada do serviço API e configuração do app Express
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import authRoutes from './routes/auth.routes.js';
import eventRoutes from './routes/event.routes.js';
import orderRoutes from './routes/order.routes.js';
import paymentRoutes, { webhookRouter } from './routes/payment.routes.js';
import userRoutes from './routes/user.routes.js';

const app = express();

// Middlewares
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN.split(',').map((origin) => origin.trim()),
    credentials: true,
  })
);
app.use(pinoHttp({ logger }));
// Middleware de raw body deve vir antes do express.json() para permitir validação de assinatura HMAC nos webhooks
app.use('/webhooks', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '1mb' }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/auth', authRoutes);
app.use('/events', eventRoutes);
app.use('/orders', orderRoutes);
app.use('/payments', paymentRoutes);
app.use('/admin/users', userRoutes);
app.use('/webhooks/payment', webhookRouter);

// Error handler
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error(err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

const PORT = parseInt(env.PORT, 10) || 3000;

/**
 * Função de graceful shutdown que encerra o servidor de forma controlada.
 * Pode ser expandida para fechar conexões com banco de dados e filas antes de encerrar.
 */
async function shutdown(): Promise<void> {
  logger.info('Encerrando servidor...');
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

app.listen(PORT, () => {
  logger.info(`API rodando na porta ${PORT}`);
  logger.info('RabbitMQ e Redis configurados para uso em produção');
});
