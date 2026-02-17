# Arquitetura do Backend - BilheteriaTech

## Padrão Arquitetural: Clean Architecture / Layered Architecture

O backend segue uma arquitetura em camadas bem definida, separando responsabilidades e facilitando manutenção e testes.

## Estrutura de Camadas

```
services/api/src/
├── controllers/     # Camada de Apresentação (HTTP)
├── services/        # Camada de Lógica de Negócio
├── repositories/    # Camada de Acesso a Dados
├── dtos/           # Data Transfer Objects
├── validators/      # Validação de Entrada (Zod schemas)
├── middlewares/     # Middlewares HTTP
├── utils/           # Utilitários
├── types/           # Tipos TypeScript
└── config/          # Configurações
```

## Responsabilidades de Cada Camada

### 1. **Controllers** (Camada de Apresentação)
- **Responsabilidade**: Receber requisições HTTP e retornar respostas
- **Não deve conter**: Lógica de negócio, acesso direto ao banco
- **Deve**: Validar entrada, chamar services, tratar erros HTTP

**Exemplo:**
```typescript
export async function createEvent(req: Request, res: Response) {
  const data = CreateEventDTO.parse(req.body); // Validação
  const event = await eventService.createEvent(data); // Chama service
  res.status(201).json(event); // Retorna resposta
}
```

### 2. **Services** (Camada de Lógica de Negócio)
- **Responsabilidade**: Implementar regras de negócio
- **Não deve conter**: Acesso direto ao banco, lógica HTTP
- **Deve**: Orquestrar repositories, aplicar validações de negócio

**Exemplo:**
```typescript
async createOrder(userId: string, data: CreateOrderInput) {
  // Buscar evento
  const event = await this.eventRepository.findById(data.eventId);
  
  // Validar disponibilidade (regra de negócio)
  const ordersCount = await this.orderRepository.countByEventAndStatus(...);
  if (ordersCount + data.quantity > event.totalTickets) {
    throw new Error('Tickets insuficientes');
  }
  
  // Criar pedido
  return await this.orderRepository.create(...);
}
```

### 3. **Repositories** (Camada de Acesso a Dados)
- **Responsabilidade**: Abstrair acesso ao banco de dados
- **Não deve conter**: Lógica de negócio
- **Deve**: Encapsular queries Prisma, retornar entidades

**Exemplo:**
```typescript
async findAll(): Promise<Event[]> {
  return this.db.event.findMany({
    orderBy: { date: 'asc' },
  });
}
```

### 4. **DTOs** (Data Transfer Objects)
- **Responsabilidade**: Definir estrutura de dados entre camadas
- **Usa**: Zod para validação e inferência de tipos
- **Benefícios**: Type-safety, validação automática

**Exemplo:**
```typescript
export const CreateEventDTO = z.object({
  title: z.string().min(1).max(200),
  date: z.string().datetime(),
  priceCents: z.number().int().positive(),
});
```

## Fluxo de Dados

```
HTTP Request
    ↓
Controller (valida entrada com DTO)
    ↓
Service (lógica de negócio)
    ↓
Repository (acesso ao banco)
    ↓
Prisma → PostgreSQL
    ↓
Repository (retorna entidade)
    ↓
Service (processa e retorna)
    ↓
Controller (formata resposta HTTP)
    ↓
HTTP Response
```

## Benefícios desta Arquitetura

1. **Separação de Responsabilidades**: Cada camada tem uma responsabilidade única
2. **Testabilidade**: Fácil mockar repositories para testar services
3. **Manutenibilidade**: Mudanças em uma camada não afetam outras
4. **Reutilização**: Services podem ser reutilizados em diferentes contextos
5. **Type Safety**: DTOs garantem tipos corretos em todas as camadas
6. **Escalabilidade**: Fácil adicionar novas features seguindo o padrão

## Design Patterns Utilizados

### Repository Pattern
- Abstrai acesso ao banco de dados
- Facilita troca de ORM no futuro
- Centraliza queries complexas

### Service Pattern
- Encapsula lógica de negócio
- Orquestra múltiplos repositories
- Aplica validações de negócio

### DTO Pattern
- Define contratos entre camadas
- Valida dados de entrada
- Garante type safety

### Dependency Injection
- Services recebem repositories via construtor
- Facilita testes e mock
- Baixo acoplamento

## Exemplo Completo de Fluxo

### Criar Pedido:

1. **Controller** (`order.controller.ts`):
   - Recebe `POST /orders`
   - Valida com `CreateOrderDTO`
   - Extrai `userId` do token JWT
   - Chama `orderService.createOrder()`

2. **Service** (`order.service.ts`):
   - Busca evento via `eventRepository`
   - Valida disponibilidade de tickets
   - Calcula valor total
   - Cria pedido via `orderRepository`

3. **Repository** (`order.repository.ts`):
   - Executa `prisma.order.create()`
   - Retorna entidade Order

4. **Response**:
   - Service retorna Order
   - Controller formata JSON
   - HTTP 201 com dados do pedido

