# API Backend - BilheteriaTech

API REST do sistema de bilheteria. Responsável por autenticação, eventos, pedidos, pagamentos e integração com filas (RabbitMQ) e cache (Redis).

---

## Stack

| Tecnologia | Uso |
|------------|-----|
| **Node.js** | Runtime |
| **TypeScript** | Linguagem |
| **Express** | Framework HTTP |
| **Prisma** | ORM |
| **PostgreSQL** | Banco de dados |
| **Zod** | Validação de entrada (DTOs) |
| **JWT** | Autenticação |
| **Bcrypt** | Hash de senhas |
| **Pino** | Logging |
| **Helmet** | Headers de segurança |
| **RabbitMQ** (amqplib) | Fila de mensagens (webhooks) |
| **Redis** (ioredis) | Cache e sessões |

---

## Como rodar

O projeto é executado via Docker. Na **raiz do monorepo**:

```bash
docker compose up --build
```

A API sobe na porta 3000; migrations e seed rodam no startup do container. Para passos completos, credenciais e troubleshooting, use a documentação na raiz:

- **[QUICKSTART.md](QUICKSTART.md)** — como subir, acessar e testar o sistema
- **[ARCHITECTURE.md](ARCHITECTURE.md)** — visão geral do sistema, componentes e fluxos

### Scripts (dentro do container ou local)

Na pasta `services/api`:

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Sobe a API em modo watch (tsx) |
| `npm run build` | Compila TypeScript para `dist/` |
| `npm run start` | Roda a aplicação compilada |
| `npm run prisma:generate` | Gera o Prisma Client |
| `npm run prisma:migrate` | Executa migrations (dev) |
| `npm run prisma:migrate:deploy` | Executa migrations (produção) |
| `npm run prisma:seed` | Popula o banco (admin + eventos exemplo) |
| `npm run prisma:studio` | Abre o Prisma Studio |

---

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `DATABASE_URL` | Sim | URL PostgreSQL (ex: `postgresql://user:pass@host:5432/db`) |
| `JWT_SECRET` | Sim | Secret para tokens de usuários |
| `ADMIN_JWT_SECRET` | Sim | Secret para tokens de admin |
| `WEBHOOK_SECRET` | Sim | Secret para assinatura HMAC dos webhooks |
| `PAYMENT_MOCK_URL` | Sim | URL do serviço mock de pagamento |
| `API_BASE_URL` | Não | URL base da API (default: `http://localhost:3000`) |
| `NODE_ENV` | Não | `development` ou `production` |
| `PORT` | Não | Porta do servidor (default: `3000`) |
| `CORS_ORIGIN` | Não | Origens permitidas, separadas por vírgula |
| `LOG_LEVEL` | Não | Nível de log (ex: `info`, `debug`) |
| `QUEUE_TYPE` | Não | `rabbitmq` ou `direct` (default: `rabbitmq`) |
| `RABBITMQ_URL` | Não* | URL do RabbitMQ (*obrigatório se `QUEUE_TYPE=rabbitmq`) |
| `REDIS_URL` | Não | URL do Redis |

---

## Endpoints da API

### Health

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/health` | Status da API |

### Autenticação (`/auth`)

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/auth/register` | Não | Cadastro de cliente |
| POST | `/auth/login` | Não | Login de cliente (rate limit: 5/15min) |
| POST | `/auth/admin/login` | Não | Login de admin (rate limit: 5/15min) |

### Eventos (`/events`)

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/events` | Não | Lista eventos |
| GET | `/events/:id` | Não | Detalhe do evento |
| POST | `/events` | Admin | Criar evento |
| PUT | `/events/:id` | Admin | Atualizar evento |
| DELETE | `/events/:id` | Admin | Remover evento |

### Pedidos (`/orders`)

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/orders` | User | Criar pedido |
| GET | `/orders/me/orders` | User | Meus pedidos |
| GET | `/orders/admin/orders` | Admin | Listar todos os pedidos |
| GET | `/orders/:id` | User/Admin | Detalhe do pedido |

### Pagamentos (`/payments`)

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/payments/fake` | User | Processar pagamento fake (cartão 4242...) |

### Webhooks

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/webhooks/payment` | Assinatura HMAC | Recebe confirmação de pagamento (body raw para validação) |

### Usuários (admin)

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/admin/users` | Admin | Listar usuários |

### Autenticação nas requisições

- Cliente/Admin: header `Authorization: Bearer <token>`
- Webhook: header `x-signature` com HMAC SHA256 do body (raw)

---

## Modelos de dados (Prisma)

- **User**: id, name, email (unique), passwordHash, role (USER | ADMIN), createdAt
- **Event**: id, title, description, date, priceCents, totalTickets, createdAt
- **Order**: id, userId, eventId, quantity, amountCents, status (PENDING | PAID | CANCELLED), createdAt
- **Payment**: id, orderId, provider, status (PENDING | PAID | FAILED), payload (JSON), createdAt

Relacionamentos: User → Order; Event → Order; Order → Payment.

---

## Arquitetura

A API segue uma arquitetura em camadas (Clean Architecture / Layered).

### Estrutura de pastas

```
src/
├── controllers/    # Apresentação HTTP: recebe request, valida com DTO, chama service, devolve response
├── services/       # Lógica de negócio: orquestra repositories e regras
├── repositories/   # Acesso a dados: encapsula Prisma (queries)
├── dtos/           # Contratos de entrada/saída com Zod (validação + tipos)
├── validators/     # Reexportam DTOs (compatibilidade)
├── middlewares/    # auth, authenticateAdmin
├── utils/          # jwt, webhook (HMAC)
├── types/          # Tipos TypeScript (ex: RequestWithUser)
├── config/         # env, logger, database
└── routes/         # Definição das rotas por domínio
```

### Fluxo de uma requisição

1. **Controller** — Valida o body/params com DTO (Zod), extrai usuário do JWT se necessário, chama o **Service**.
2. **Service** — Aplica regras de negócio, usa **Repositories** para ler/escrever no banco, retorna dados para o controller.
3. **Repository** — Executa operações Prisma e retorna entidades.

### Design patterns

- **Repository**: abstração do acesso a dados (Prisma); facilita testes e troca de ORM.
- **Service**: lógica de negócio em uma camada única; reutilizável.
- **DTO (Zod)**: validação e tipo em um só lugar; contratos claros entre camadas.
- **Dependency Injection**: repositories e serviços injetados por construtor (facilita mock em testes).

### Integrações

- **RabbitMQ**: publicação de webhooks na fila `webhook-payments` para processamento assíncrono pelo worker. Conexão e reconexão tratadas em `queue.service.ts`.
- **Redis**: serviço de cache em `queue.service.ts` (createRedisService); uso opcional para cache de eventos/sessões.

---

## Segurança

- **Senhas**: bcrypt (hash antes de persistir).
- **JWT**: secrets separados para usuário e admin; token no header `Authorization: Bearer <token>`.
- **Webhooks**: assinatura HMAC SHA256 do body raw com `WEBHOOK_SECRET`; validação em `utils/webhook.ts`.
- **Rate limit**: 5 tentativas de login por 15 minutos (express-rate-limit).
- **HTTP**: Helmet para headers seguros, CORS configurável por origem.

---

## Como adicionar um novo recurso

1. **DTO** (`dtos/`): definir schema Zod para entrada (e saída se necessário).
2. **Repository** (`repositories/`): métodos de leitura/escrita no banco (Prisma).
3. **Service** (`services/`): regras de negócio, chamando o repository.
4. **Controller** (`controllers/`): parse do body com DTO, chamada ao service, resposta HTTP.
5. **Rotas** (`routes/`): registrar verbos e middlewares (authenticate / authenticateAdmin).

Exemplo mínimo para um “produto”:

- `dtos/product.dto.ts`: `CreateProductDTO`, `UpdateProductDTO`.
- `repositories/product.repository.ts`: `create`, `findById`, `findAll`, etc.
- `services/product.service.ts`: `createProduct`, `getProduct`, etc.
- `controllers/product.controller.ts`: funções que recebem `req`/`res`, validam com DTO e chamam o service.
- `routes/product.routes.ts`: `router.post('/', authenticateAdmin, createProduct);` e afins.
- Em `index.ts`: `app.use('/products', productRoutes);`

---

## Observabilidade

- **Logs**: Pino (JSON em produção, pretty em dev).
- **Health**: `GET /health` retorna `{ status: 'ok', timestamp }`.

---

## Documentação

A documentação completa do projeto está na **raiz do monorepo**:

| Documento (raiz) | Descrição |
|------------------|-----------|
| [QUICKSTART.md](QUICKSTART.md) | Como subir com Docker, acessar as aplicações, credenciais e testar o fluxo |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Arquitetura do sistema, componentes, fluxos, segurança e variáveis de ambiente |

Outros arquivos de referência:

- [README.md](../../README.md) — visão geral e deploy
- [docs/RABBITMQ_REDIS_SETUP.md](../../docs/RABBITMQ_REDIS_SETUP.md) — RabbitMQ e Redis
- [ARCHITECTURE.md](./ARCHITECTURE.md) (neste diretório) — arquitetura em camadas do backend
