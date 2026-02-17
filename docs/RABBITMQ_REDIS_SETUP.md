# Configuração RabbitMQ + Redis - BilheteriaTech

## Visão Geral

O sistema utiliza RabbitMQ para filas de mensagens (webhooks) e Redis para cache e sessões. Esta configuração funciona tanto em desenvolvimento local quanto em produção.

## Arquitetura

```
Webhook → API → RabbitMQ (Fila) → Worker → RDS
                ↓
            Redis (Cache)
```

### Componentes:

1. **RabbitMQ**: Fila de mensagens para processamento assíncrono de webhooks
2. **Redis**: Cache de dados e armazenamento de sessões
3. **Worker**: Processa mensagens da fila RabbitMQ

## Desenvolvimento Local

### 1. Subir serviços com Docker Compose

```bash
docker compose up rabbitmq redis webhook-worker
```

### 2. Verificar serviços

**RabbitMQ UI:**
- URL: http://localhost:15672
- Usuário: `admin`
- Senha: `admin123`

**Redis:**
- Porta: `6379`
- Teste: `docker compose exec redis redis-cli ping` (deve retornar `PONG`)

### 3. Variáveis de Ambiente

No `.env`:
```env
QUEUE_TYPE=rabbitmq
RABBITMQ_URL=amqp://admin:admin123@rabbitmq:5672
REDIS_URL=redis://redis:6379
```

## Produção

### Opção 1: RabbitMQ Gerenciado (CloudAMQP, AWS MQ, etc)

```env
RABBITMQ_URL=amqps://user:pass@host:5672
REDIS_URL=rediss://host:6379
```

### Opção 2: Self-hosted

```bash
# Instalar RabbitMQ
sudo apt-get install rabbitmq-server

# Instalar Redis
sudo apt-get install redis-server

# Configurar
RABBITMQ_URL=amqp://user:pass@localhost:5672
REDIS_URL=redis://localhost:6379
```

## Configuração Detalhada

### RabbitMQ

**Fila criada automaticamente:**
- Nome: `webhook-payments`
- Durabilidade: `true` (persiste após reinicialização)
- Mensagens persistentes: `true`

**Monitoramento:**
- Acesse http://localhost:15672
- Veja mensagens na fila
- Monitore consumo e processamento

### Redis

**Uso principal:**
- Cache de eventos
- Cache de sessões
- Rate limiting
- Dados temporários

**Exemplo de uso:**
```typescript
import { createRedisService } from './services/queue.service.js';

const redis = createRedisService();

// Cachear evento por 1 hora
await redis.set(`event:${eventId}`, eventData, 3600);

// Buscar do cache
const cached = await redis.get(`event:${eventId}`);
```

## Fluxo de Webhook

1. **Payment Mock** → Dispara webhook para API
2. **API** → Valida assinatura HMAC
3. **API** → Publica mensagem no RabbitMQ
4. **API** → Responde 200 OK (rápido!)
5. **Worker** → Consome mensagem da fila
6. **Worker** → Processa webhook
7. **Worker** → Atualiza RDS (Order + Payment)
8. **Worker** → Confirma mensagem (ack)

### Retry Automático

Se o processamento falhar:
- Mensagem é reenviada para a fila (nack com requeue)
- Worker tenta processar novamente
- Após múltiplas falhas, pode ser enviada para DLQ (Dead Letter Queue)

## Monitoramento

### RabbitMQ

```bash
# Ver filas
docker compose exec rabbitmq rabbitmqctl list_queues

# Ver conexões
docker compose exec rabbitmq rabbitmqctl list_connections

# Ver mensagens não processadas
docker compose exec rabbitmq rabbitmqctl list_queues name messages
```

### Redis

```bash
# Conectar ao Redis
docker compose exec redis redis-cli

# Ver todas as chaves
KEYS *

# Ver valor de uma chave
GET event:abc123

# Ver TTL de uma chave
TTL event:abc123
```

## Troubleshooting

### Worker não consome mensagens

1. Verificar conexão RabbitMQ:
   ```bash
   docker compose logs webhook-worker | grep RabbitMQ
   ```

2. Verificar se a fila existe:
   ```bash
   docker compose exec rabbitmq rabbitmqctl list_queues
   ```

3. Verificar logs do worker:
   ```bash
   docker compose logs -f webhook-worker
   ```

### Redis não conecta

1. Verificar se Redis está rodando:
   ```bash
   docker compose ps redis
   ```

2. Testar conexão:
   ```bash
   docker compose exec redis redis-cli ping
   ```

3. Verificar URL no `.env`:
   ```env
   REDIS_URL=redis://redis:6379  # Docker
   REDIS_URL=redis://localhost:6379  # Local
   ```

### Mensagens ficam na fila

1. Verificar se worker está rodando:
   ```bash
   docker compose ps webhook-worker
   ```

2. Verificar logs de erro:
   ```bash
   docker compose logs webhook-worker | grep ERROR
   ```

3. Verificar conexão com banco:
   ```bash
   docker compose logs webhook-worker | grep DATABASE
   ```

## Segurança

### RabbitMQ

- Use credenciais fortes em produção
- Configure SSL/TLS (`amqps://`)
- Limite acesso por IP/VPC
- Use usuários com permissões mínimas

### Redis

- Configure senha (`requirepass` no redis.conf)
- Use SSL/TLS (`rediss://`)
- Limite acesso por IP/VPC
- Não exponha Redis publicamente

## Exemplo de Uso

### Publicar Webhook (API)

```typescript
import { createQueueService } from './services/queue.service.js';

const queue = createQueueService();

await queue.publishWebhook({
  orderId: 'xxx',
  paymentId: 'yyy',
  status: 'PAID'
});
```

### Usar Redis (API)

```typescript
import { createRedisService } from './services/queue.service.js';

const redis = createRedisService();

// Cachear evento
await redis.set(`event:${id}`, event, 3600);

// Buscar do cache
const cached = await redis.get(`event:${id}`);
```

## Verificações de Deploy

Antes de fazer deploy em produção, verifique:

- RabbitMQ configurado e acessível
- Redis configurado e acessível
- Worker rodando e consumindo mensagens
- Variáveis de ambiente configuradas corretamente
- Credenciais seguras em produção
- SSL/TLS habilitado em produção
- Monitoramento configurado
- Logs sendo coletados adequadamente

## Recursos

- [RabbitMQ Docs](https://www.rabbitmq.com/documentation.html)
- [Redis Docs](https://redis.io/documentation)
- [amqplib Docs](https://www.npmjs.com/package/amqplib)
- [ioredis Docs](https://github.com/redis/ioredis)
