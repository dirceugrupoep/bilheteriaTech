/**
 * @project BilheteriaTech
 * @author Dirceu Silva de Oliveira Tech
 * @date 2026-02-16
 * @description Serviço mock de gateway de pagamento que simula processamento de pagamentos e dispara webhooks de confirmação para o sistema de bilheteria.
 */
import express from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import axios from 'axios';
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport:
    process.env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
          },
        }
      : undefined,
});

const app = express();

app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Endpoint para disparar webhook após simulação de processamento
app.post('/webhook/trigger', async (req, res) => {
  try {
    const { orderId, paymentId, status, signature, webhookUrl } = req.body;

    if (!orderId || !paymentId || !status || !webhookUrl) {
      res.status(400).json({ error: 'Dados incompletos' });
      return;
    }

    logger.info(`Simulando processamento de pagamento para pedido ${orderId}`);

    // Simular delay de processamento (1-2 segundos)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Disparar webhook para a API
    const payload = {
      orderId,
      paymentId,
      status,
    };

    try {
      await axios.post(webhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
          'x-signature': signature,
        },
        timeout: 5000,
      });

      logger.info(`Webhook disparado com sucesso para ${webhookUrl}`);
      res.json({ success: true, message: 'Webhook disparado' });
    } catch (error) {
      logger.error('Erro ao disparar webhook:', error);
      res.status(500).json({ error: 'Erro ao disparar webhook' });
    }
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: 'Erro ao processar requisição' });
  }
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  logger.info(`Payment Mock rodando na porta ${PORT}`);
});
