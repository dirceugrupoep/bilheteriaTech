/**
 * Service para publicação de mensagens em filas RabbitMQ e gerenciamento de cache Redis.
 * Implementa conexão e reconexão automática, publicação de mensagens persistentes
 * e operações de cache com TTL configurável.
 * 
 * @project BilheteriaTech
 * @author Dirceu Silva de Oliveira Tech
 * @date 2026-02-17
 */
import amqp, { Connection, Channel } from 'amqplib';
import Redis from 'ioredis';
import { logger } from '../config/logger.js';
import { WebhookInput } from '../dtos/payment.dto.js';

export interface QueueService {
  publishWebhook(message: WebhookInput): Promise<void>;
  close(): Promise<void>;
}

/**
 * Implementação do serviço de filas usando RabbitMQ.
 * Gerencia conexão, canal e publicação de mensagens com reconexão automática.
 */
export class RabbitMQService implements QueueService {
  private connection: Connection | null = null;
  private channel: Channel | null = null;
  private readonly queueName = 'webhook-payments';
  private readonly connectionUrl: string;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;

  constructor(connectionUrl: string) {
    this.connectionUrl = connectionUrl;
  }

  async connect(): Promise<void> {
    try {
      if (this.connection && !this.connection.connection.readyState) {
        this.connection = null;
        this.channel = null;
      }

      if (!this.connection) {
        this.connection = await amqp.connect(this.connectionUrl);
        logger.info('Conectado ao RabbitMQ');

        this.connection.on('error', (err) => {
          logger.error('Erro na conexão RabbitMQ:', err);
          this.connection = null;
          this.channel = null;
        });

        this.connection.on('close', () => {
          logger.warn('Conexão RabbitMQ fechada');
          this.connection = null;
          this.channel = null;
        });
      }

      if (!this.channel) {
        this.channel = await this.connection.createChannel();
        await this.channel.assertQueue(this.queueName, {
          durable: true, // A fila persiste mesmo após reinicialização do RabbitMQ
        });
        logger.info(`Fila ${this.queueName} garantida`);
      }
    } catch (error) {
      logger.error('Erro ao conectar ao RabbitMQ:', error);
      this.reconnectAttempts++;
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        logger.info(`Tentando reconectar ao RabbitMQ (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
        await new Promise((resolve) => setTimeout(resolve, 5000));
        return this.connect();
      }
      throw error;
    }
  }

  async publishWebhook(message: WebhookInput): Promise<void> {
    try {
      if (!this.channel || !this.connection) {
        await this.connect();
      }

      if (!this.channel) {
        throw new Error('Canal RabbitMQ não disponível');
      }

      const messageBuffer = Buffer.from(JSON.stringify(message));
      const published = this.channel.sendToQueue(this.queueName, messageBuffer, {
        persistent: true, // A mensagem persiste mesmo após reinicialização do RabbitMQ
      });

      if (published) {
        logger.info('Webhook publicado no RabbitMQ', {
          queue: this.queueName,
          paymentId: message.paymentId,
        });
      } else {
        throw new Error('Falha ao publicar mensagem no RabbitMQ');
      }
    } catch (error) {
      logger.error('Erro ao publicar webhook no RabbitMQ:', error);
      // Tenta reconectar e republicar a mensagem em caso de falha
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.connection = null;
        this.channel = null;
        await this.connect();
        return this.publishWebhook(message);
      }
      throw error;
    }
  }

  async close(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
        this.channel = null;
      }
      if (this.connection) {
        await this.connection.close();
        this.connection = null;
      }
      logger.info('Conexão RabbitMQ fechada');
    } catch (error) {
      logger.error('Erro ao fechar conexão RabbitMQ:', error);
    }
  }
}

/**
 * Serviço para gerenciamento de cache e sessões usando Redis.
 * Fornece operações básicas de cache com suporte a TTL e reconexão automática.
 */
export class RedisService {
  private client: Redis | null = null;
  private readonly connectionUrl: string;

  constructor(connectionUrl: string) {
    this.connectionUrl = connectionUrl;
  }

  async connect(): Promise<void> {
    try {
      if (!this.client || this.client.status !== 'ready') {
        this.client = new Redis(this.connectionUrl, {
          retryStrategy: (times) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
          },
          maxRetriesPerRequest: 3,
        });

        this.client.on('error', (err) => {
          logger.error('Erro no Redis:', err);
        });

        this.client.on('connect', () => {
          logger.info('Conectado ao Redis');
        });

        this.client.on('ready', () => {
          logger.info('Redis pronto para uso');
        });
      }
    } catch (error) {
      logger.error('Erro ao conectar ao Redis:', error);
      throw error;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      if (!this.client) {
        await this.connect();
      }
      const value = await this.client!.get(key);
      return value ? (JSON.parse(value) as T) : null;
    } catch (error) {
      logger.error(`Erro ao buscar chave ${key} no Redis:`, error);
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    try {
      if (!this.client) {
        await this.connect();
      }
      const serialized = JSON.stringify(value);
      if (ttlSeconds) {
        await this.client!.setex(key, ttlSeconds, serialized);
      } else {
        await this.client!.set(key, serialized);
      }
    } catch (error) {
      logger.error(`Erro ao salvar chave ${key} no Redis:`, error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      if (!this.client) {
        await this.connect();
      }
      await this.client!.del(key);
    } catch (error) {
      logger.error(`Erro ao deletar chave ${key} no Redis:`, error);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      if (!this.client) {
        await this.connect();
      }
      const result = await this.client!.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Erro ao verificar chave ${key} no Redis:`, error);
      return false;
    }
  }

  async close(): Promise<void> {
    try {
      if (this.client) {
        await this.client.quit();
        this.client = null;
        logger.info('Conexão Redis fechada');
      }
    } catch (error) {
      logger.error('Erro ao fechar conexão Redis:', error);
    }
  }
}

/**
 * Factory function que cria uma instância do serviço de filas baseado na variável
 * de ambiente QUEUE_TYPE. Por padrão utiliza RabbitMQ.
 */
export function createQueueService(): QueueService {
  const queueType = process.env.QUEUE_TYPE || 'rabbitmq';
  const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://admin:admin123@localhost:5672';

  if (queueType === 'rabbitmq') {
    const service = new RabbitMQService(rabbitmqUrl);
    // Conecta de forma assíncrona para não bloquear a inicialização do servidor
    service.connect().catch((err) => {
      logger.error('Erro ao conectar RabbitMQ no startup:', err);
    });
    return service;
  }

  // Modo fallback sem fila: processa webhooks diretamente (apenas para desenvolvimento/testes)
  logger.warn('Modo sem fila ativado - webhooks serão processados diretamente');
  return {
    async publishWebhook(message: WebhookInput): Promise<void> {
      logger.info('Processando webhook diretamente (sem fila)', { message });
    },
    async close(): Promise<void> {
      // Nada a fazer
    },
  };
}

/**
 * Factory function que cria uma instância do serviço Redis.
 * A conexão é estabelecida de forma assíncrona para não bloquear a inicialização.
 */
export function createRedisService(): RedisService {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  const service = new RedisService(redisUrl);
  // Conecta de forma assíncrona para não bloquear a inicialização do servidor
  service.connect().catch((err) => {
    logger.error('Erro ao conectar Redis no startup:', err);
  });
  return service;
}
