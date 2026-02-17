/**
 * Worker que consome mensagens da fila RabbitMQ e processa webhooks de pagamento.
 * Processa mensagens de forma assíncrona, atualizando o status de pedidos e pagamentos
 * no banco de dados. Implementa reconexão automática e retry em caso de falhas.
 * 
 * @project BilheteriaTech
 * @author Dirceu Silva de Oliveira Tech
 * @date 2026-02-17
 */
import { PrismaClient } from '@prisma/client';
import amqp, { Connection, Channel, ConsumeMessage } from 'amqplib';
import pino from 'pino';
import { PaymentRepository } from './repositories/payment.repository.js';
import { OrderRepository } from './repositories/order.repository.js';
import { PaymentService } from './services/payment.service.js';

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

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

const paymentService = new PaymentService(
  new PaymentRepository(prisma),
  new OrderRepository(prisma)
);

const queueName = 'webhook-payments';
let connection: Connection | null = null;
let channel: Channel | null = null;

async function connectRabbitMQ(): Promise<void> {
  try {
    const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://admin:admin123@localhost:5672';
    
    connection = await amqp.connect(rabbitmqUrl);
    logger.info('Conectado ao RabbitMQ');

    connection.on('error', (err) => {
      logger.error('Erro na conexão RabbitMQ:', err);
      connection = null;
      channel = null;
    });

    connection.on('close', () => {
      logger.warn('Conexão RabbitMQ fechada');
      connection = null;
      channel = null;
    });

    channel = await connection.createChannel();
    await channel.assertQueue(queueName, {
      durable: true, // A fila persiste mesmo após reinicialização do RabbitMQ
    });

    // Configura o prefetch para processar uma mensagem por vez, garantindo processamento sequencial
    await channel.prefetch(1);

    logger.info(`Fila ${queueName} garantida e pronta para consumo`);
  } catch (error) {
    logger.error('Erro ao conectar ao RabbitMQ:', error);
    throw error;
  }
}

async function processWebhookMessage(msg: ConsumeMessage | null): Promise<void> {
  if (!msg) {
    return;
  }

  try {
    const content = msg.content.toString();
    const data = JSON.parse(content);

    logger.info('Processando webhook da fila', {
      paymentId: data.paymentId,
      orderId: data.orderId,
      status: data.status,
    });

    await paymentService.processWebhook({
      orderId: data.orderId,
      paymentId: data.paymentId,
      status: data.status,
    });

    // Confirma o processamento bem-sucedido removendo a mensagem da fila
    if (channel) {
      channel.ack(msg);
      logger.info('Webhook processado com sucesso', { paymentId: data.paymentId });
    }
  } catch (error) {
    logger.error('Erro ao processar webhook da fila:', error);

    // Rejeita a mensagem e a reenvia para a fila para tentar processar novamente
    if (channel) {
      channel.nack(msg, false, true); // requeue = true para retry automático
      logger.warn('Mensagem reenviada para a fila para retry', {
        paymentId: (msg.content ? JSON.parse(msg.content.toString()).paymentId : 'unknown'),
      });
    }
  }
}

async function startConsumer(): Promise<void> {
  try {
    await connectRabbitMQ();

    if (!channel) {
      throw new Error('Canal RabbitMQ não disponível');
    }

    logger.info(`Iniciando consumo da fila ${queueName}...`);

    await channel.consume(
      queueName,
      async (msg) => {
        await processWebhookMessage(msg);
      },
      {
        noAck: false, // Confirmação manual: precisamos fazer ack ou nack explicitamente
      }
    );

    logger.info(`Worker pronto e consumindo mensagens da fila ${queueName}`);
  } catch (error) {
    logger.error('Erro ao iniciar consumidor:', error);
    throw error;
  }
}

/**
 * Função que tenta reconectar ao RabbitMQ em caso de falha na conexão.
 * Implementa retry com backoff exponencial até um número máximo de tentativas.
 */
async function reconnect(): Promise<void> {
  const maxRetries = 5;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      await startConsumer();
      retries = 0; // Reset contador em caso de sucesso
      break;
    } catch (error) {
      retries++;
      logger.error(`Tentativa ${retries}/${maxRetries} de reconexão falhou:`, error);
      
      if (retries < maxRetries) {
        const delay = Math.min(retries * 5000, 30000); // Delay máximo de 30 segundos
        logger.info(`Aguardando ${delay}ms antes de tentar novamente...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  if (retries >= maxRetries) {
    logger.error('Número máximo de tentativas de reconexão atingido. Encerrando worker.');
    process.exit(1);
  }
}

/**
 * Função de graceful shutdown que fecha conexões de forma controlada.
 * Fecha conexão com RabbitMQ e Prisma antes de encerrar o processo.
 */
async function shutdown(): Promise<void> {
  logger.info('Encerrando worker...');

  try {
    if (channel) {
      await channel.close();
      channel = null;
    }
    if (connection) {
      await connection.close();
      connection = null;
    }
    await prisma.$disconnect();
    logger.info('Worker encerrado com sucesso');
    process.exit(0);
  } catch (error) {
    logger.error('Erro ao encerrar worker:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Tratamento de erros não capturados para evitar crashes silenciosos
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', { reason, promise });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  shutdown();
});

/**
 * Função principal que inicia o worker.
 * Tenta iniciar o consumidor e, em caso de falha, tenta reconectar automaticamente.
 */
async function main(): Promise<void> {
  try {
    logger.info('Iniciando webhook worker...');
    await startConsumer();
  } catch (error) {
    logger.error('Erro ao iniciar worker:', error);
    await reconnect();
  }
}

main();
