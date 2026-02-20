# BilheteriaTech

Sistema de bilheteria com:

- site do cliente (`apps/web`)
- painel administrativo (`apps/admin`)
- API em Express (`services/api`)
- mock de pagamento (`services/payment-provider-mock`)
- processamento assíncrono de webhook via RabbitMQ (`services/webhook-worker`)
- opção de processamento serverless em AWS Lambda (`lambda/webhook-processor`)

## Status atual (para avaliação técnica)

- `local Docker`: pronto para uso
- `API Express`: pronta, com autenticação JWT, validação Zod e webhook assinado
- `worker RabbitMQ`: pronto para execução local no compose
- `Lambda webhook`: estruturada e validando HMAC; uso opcional em produção AWS

## Stack

- Node.js + TypeScript
- Express
- Prisma + PostgreSQL
- RabbitMQ + Redis
- React + Vite + MUI
- Docker / Docker Compose

## Estrutura

```txt
bilheteriaTech/
├── apps/
│   ├── web/
│   └── admin/
├── services/
│   ├── api/
│   ├── payment-provider-mock/
│   └── webhook-worker/
├── lambda/
│   └── webhook-processor/
├── docker-compose.yml
├── .env.example
└── ARCHITECTURE.md
```

## Executar local (Docker)

1. Copie o ambiente:

```bash
cp .env.example .env
```

2. Suba os serviços:

```bash
docker compose up --build
```

3. Acesse:

- Web cliente: `http://localhost:5173`
- Admin: `http://localhost:5174`
- API health: `http://localhost:3000/health`
- RabbitMQ UI: `http://localhost:15672`

## Credenciais padrão

- Admin:
  - email: `admin@bilheteriatech.local`
  - senha: `Admin@123`
- RabbitMQ UI:
  - user: `admin`
  - senha: `admin123`

## Fluxo principal de pagamento

1. Cliente cria pedido.
2. Cliente paga (simulação fake).
3. Mock envia webhook assinado para a API.
4. API valida assinatura, publica mensagem na fila.
5. Worker consome fila e atualiza pedido/pagamento.

## Endpoints principais

- `GET /health`
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/admin/login`
- `GET|POST /events`
- `POST /orders`
- `GET /orders/me/orders`
- `POST /payments/fake`
- `POST /webhooks/payment`
- `GET /admin/users`

## Produção AWS (resumo)

- Frontends: S3 + CloudFront
- API/Mock: containers em EC2/ECS
- Banco: RDS PostgreSQL
- Processamento assíncrono:
  - opção A: RabbitMQ + webhook-worker
  - opção B: Lambda `lambda/webhook-processor`

## Deploy CI/CD

Workflow atual em `.github/workflows/deploy.yml`:

- build/deploy de web e admin para S3 + invalidação CloudFront
- build/push de API e payment-mock
- atualização no servidor alvo

## Observações de arquitetura

- API e payment-mock são Express.
- Worker e Lambda não usam Express por desenho arquitetural.
- Mais detalhes em `ARCHITECTURE.md` e `services/api/ARCHITECTURE.md`.
