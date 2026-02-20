# Arquitetura - BilheteriaTech

## Componentes

- `apps/web`: frontend cliente (React + Vite)
- `apps/admin`: frontend administrativo (React + Vite)
- `services/api`: API principal (Node.js + Express + Prisma)
- `services/payment-provider-mock`: simula gateway de pagamento e dispara webhook
- `services/webhook-worker`: consumidor RabbitMQ para processar webhooks assíncronos
- `lambda/webhook-processor`: alternativa AWS para processar webhook fora da API (opcional)

## Fluxo de pagamento

1. Cliente cria pedido em `POST /orders`.
2. Cliente inicia pagamento fake em `POST /payments/fake`.
3. API cria `payment` com status `PENDING`.
4. API envia solicitação ao `payment-provider-mock`.
5. Mock chama `POST /webhooks/payment` com assinatura HMAC.
6. API valida assinatura e publica mensagem na fila `webhook-payments`.
7. Em ambiente local, o `webhook-worker` consome a fila e atualiza `payment/order` para `PAID`.

## Modo local (Docker)

- Orquestrado via `docker-compose.yml`.
- Serviços principais: `postgres`, `api`, `payment-mock`, `web`, `admin`, `rabbitmq`, `redis`, `webhook-worker`.
- Foco em produtividade: hot reload e seeds.

## Modo produção (AWS)

- Frontends: build estático em S3 + CloudFront.
- API: container em EC2/ECS com PostgreSQL no RDS.
- Fila: RabbitMQ gerenciado ou equivalente.
- Lambda (`lambda/webhook-processor`): pode substituir/complementar o worker para processamento assíncrono.

## Segurança

- JWT separado para cliente e admin.
- Senhas com bcrypt.
- Validação de payload com Zod.
- Webhooks protegidos por HMAC (`x-signature`).

## Decisões atuais

- API e mock usam Express.
- Worker e Lambda não usam Express por natureza (consumer e handler serverless).
- Lambda é opcional e estruturada para cenário AWS.
