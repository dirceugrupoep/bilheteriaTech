# Arquitetura do Sistema BilheteriaTech

> **Documentação principal** (rodar local, build e deploy AWS): [README.md](README.md)

## Visão Geral

Sistema de bilheteria completo com arquitetura de monorepo, separando frontend (cliente e admin), backend API e serviços auxiliares.

## Componentes

### 1. Frontend Web (`apps/web`)
- **Tecnologia**: React + TypeScript + Vite
- **Porta**: 5173 (dev) / 80 (prod)
- **Funcionalidades**:
  - Listagem de eventos
  - Detalhes do evento
  - Cadastro/login de cliente
  - Compra de ingressos
  - Visualização de pedidos

### 2. Frontend Admin (`apps/admin`)
- **Tecnologia**: React + TypeScript + Vite
- **Porta**: 5174 (dev) / 80 (prod)
- **Funcionalidades**:
  - Login admin
  - CRUD de eventos
  - Visualização de pedidos
  - Visualização de usuários
  - Dashboard com estatísticas

### 3. Backend API (`services/api`)
- **Tecnologia**: Node.js + TypeScript + Express
- **Porta**: 3000
- **Banco de Dados**: PostgreSQL (Prisma ORM)
- **Endpoints principais**:
  - `/auth/*` - Autenticação
  - `/events/*` - Eventos
  - `/orders/*` - Pedidos
  - `/payments/*` - Pagamentos
  - `/webhooks/payment` - Webhook de pagamento
  - `/admin/users` - Usuários (admin)

### 4. Payment Provider Mock (`services/payment-provider-mock`)
- **Tecnologia**: Node.js + TypeScript + Express
- **Porta**: 4000
- **Funcionalidade**: Simula gateway de pagamento e dispara webhook após processamento

### 5. Lambda Function (`lambda/webhook-processor`)
- **Tecnologia**: Node.js + TypeScript
- **Funcionalidade**: Processa webhooks de pagamento (alternativa ao endpoint direto)

## Fluxo de Pagamento

1. Cliente cria pedido (`POST /orders`)
2. Cliente processa pagamento fake (`POST /payments/fake`)
3. API valida cartão (deve começar com `4242`)
4. API cria registro de pagamento com status `PENDING`
5. API chama serviço mock para disparar webhook
6. Mock aguarda 1-2 segundos e dispara webhook para API
7. API valida assinatura HMAC do webhook
8. API atualiza pedido e pagamento para `PAID`

## Segurança

- **Autenticação**: JWT com secrets separados para usuários e admin
- **Validação**: Zod para validação de entrada
- **Senhas**: Bcrypt com salt rounds 10
- **Webhooks**: Assinatura HMAC SHA256
- **Rate Limiting**: Express Rate Limit no login (5 tentativas / 15min)
- **Headers**: Helmet para segurança HTTP
- **CORS**: Configurado para origens específicas

## Banco de Dados

### Modelos Prisma

- **User**: Usuários do sistema (USER/ADMIN)
- **Event**: Eventos disponíveis
- **Order**: Pedidos de ingressos
- **Payment**: Registros de pagamento

### Migrations

- Prisma Migrate para versionamento do schema
- Seed automático com admin padrão e eventos de exemplo

## Docker

### Desenvolvimento
- Todos os serviços em modo dev com hot reload
- Volumes montados para desenvolvimento
- PostgreSQL com volume persistente

### Produção
- Build otimizado de cada serviço
- Nginx para servir frontends estáticos
- Multi-stage builds para reduzir tamanho

## Deploy AWS

### Infraestrutura

1. **VPC**: Rede isolada com subnets públicas e privadas
2. **RDS**: PostgreSQL em subnets privadas
3. **EC2**: API e Payment Mock em instância única (ou múltiplas com load balancer)
4. **S3**: Frontends estáticos
5. **CloudFront**: CDN com HTTPS
6. **Lambda**: Processamento assíncrono de webhooks (opcional)
7. **IAM**: Usuários e roles com permissões mínimas

### CI/CD

- GitHub Actions para deploy automático
- Build e push de imagens Docker para ECR
- Deploy de frontends para S3
- Invalidação de cache do CloudFront

## Variáveis de Ambiente

### Backend API
- `DATABASE_URL`: URL de conexão PostgreSQL
- `JWT_SECRET`: Secret para tokens de usuários
- `ADMIN_JWT_SECRET`: Secret para tokens de admin
- `WEBHOOK_SECRET`: Secret para assinatura de webhooks
- `PAYMENT_MOCK_URL`: URL do serviço mock
- `NODE_ENV`: Ambiente (development/production)

### Frontends
- `VITE_API_BASE_URL`: URL base da API

## Observabilidade

- **Logging**: Pino com formato JSON em produção, pretty em dev
- **Health Check**: Endpoint `/health` em todos os serviços
- **Error Handling**: Middleware centralizado de erros

