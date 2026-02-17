# API Backend - BilheteriaTech

## Arquitetura: Clean Architecture / Layered Architecture

O backend segue uma arquitetura em camadas, utilizando design patterns estabelecidos.

## Estrutura de Pastas

```
src/
├── controllers/      # Camada de Apresentação (HTTP)
│   ├── auth.controller.ts
│   ├── event.controller.ts
│   ├── order.controller.ts
│   ├── payment.controller.ts
│   └── user.controller.ts
│
├── services/         # Camada de Lógica de Negócio
│   ├── auth.service.ts
│   ├── event.service.ts
│   ├── order.service.ts
│   ├── payment.service.ts
│   └── user.service.ts
│
├── repositories/     # Camada de Acesso a Dados
│   ├── event.repository.ts
│   ├── order.repository.ts
│   ├── payment.repository.ts
│   └── user.repository.ts
│
├── dtos/            # Data Transfer Objects
│   ├── auth.dto.ts
│   ├── event.dto.ts
│   ├── order.dto.ts
│   └── payment.dto.ts
│
├── validators/       # Validação (mantido para compatibilidade)
├── middlewares/      # Middlewares HTTP
├── utils/            # Utilitários
├── types/            # Tipos TypeScript
└── config/           # Configurações
```

## Design Patterns Implementados

### 1. Repository Pattern
- **O que é**: Abstrai acesso ao banco de dados
- **Benefícios**: 
  - Facilita troca de ORM (Prisma → TypeORM, etc)
  - Centraliza queries complexas
  - Facilita testes (mock de repositories)

**Exemplo:**
```typescript
class EventRepository {
  async findAll(): Promise<Event[]> {
    return this.db.event.findMany({ orderBy: { date: 'asc' } });
  }
}
```

### 2. Service Pattern
- **O que é**: Encapsula lógica de negócio
- **Benefícios**:
  - Separa lógica de negócio de acesso a dados
  - Reutilizável em diferentes contextos
  - Fácil de testar

**Exemplo:**
```typescript
class OrderService {
  async createOrder(userId: string, data: CreateOrderInput) {
    // Valida disponibilidade
    // Calcula valores
    // Cria pedido
  }
}
```

### 3. DTO Pattern
- **O que é**: Objetos para transferência de dados
- **Benefícios**:
  - Type safety
  - Validação automática (Zod)
  - Contratos claros entre camadas

**Exemplo:**
```typescript
export const CreateEventDTO = z.object({
  title: z.string().min(1).max(200),
  date: z.string().datetime(),
  priceCents: z.number().int().positive(),
});
```

### 4. Dependency Injection
- **O que é**: Dependências injetadas via construtor
- **Benefícios**:
  - Baixo acoplamento
  - Fácil mock em testes
  - Flexibilidade

**Exemplo:**
```typescript
class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository = new OrderRepository(),
    private readonly eventRepository: EventRepository = new EventRepository()
  ) {}
}
```

## Fluxo de Dados

```
HTTP Request
    ↓
[Controller] Valida entrada com DTO
    ↓
[Service] Aplica lógica de negócio
    ↓
[Repository] Acessa banco de dados
    ↓
Prisma → PostgreSQL
    ↓
[Repository] Retorna entidade
    ↓
[Service] Processa resultado
    ↓
[Controller] Formata resposta HTTP
    ↓
HTTP Response
```

## Vantagens da Arquitetura

1. **Separação de Responsabilidades**
   - Cada camada tem uma única responsabilidade
   - Facilita o entendimento do código

2. **Testabilidade**
   - Services podem ser testados mockando repositories
   - Controllers podem ser testados mockando services
   - Testes unitários isolados

3. **Manutenibilidade**
   - Mudanças em uma camada não afetam outras
   - Código organizado e fácil de navegar
   - Facilita adicionar novas funcionalidades

4. **Escalabilidade**
   - Facilita adicionar camadas de cache
   - Facilita adicionar eventos de domínio
   - Preparado para crescimento

5. **Type Safety**
   - TypeScript em todas as camadas
   - DTOs garantem tipos corretos
   - Reduz erros em runtime

## Melhores Práticas Aplicadas

1. Single Responsibility Principle: Cada classe tem uma responsabilidade única
2. Dependency Inversion: Dependências injetadas, não hardcoded
3. Open/Closed Principle: Fácil estender sem modificar código existente
4. DRY (Don't Repeat Yourself): Lógica centralizada para evitar duplicação
5. Type Safety: TypeScript e Zod em todas as camadas garantem tipos corretos
6. Error Handling: Erros tratados adequadamente em cada camada

## Padrões Utilizados

A arquitetura utiliza:
- Clean Architecture
- Domain-Driven Design
- Princípios SOLID
- Repository Pattern
- Service Layer Pattern

## Como Usar

### Criar um novo endpoint:

1. **Criar DTO** (`dtos/`):
```typescript
export const CreateProductDTO = z.object({ ... });
```

2. **Criar Repository** (`repositories/`):
```typescript
class ProductRepository {
  async create(data) { ... }
}
```

3. **Criar Service** (`services/`):
```typescript
class ProductService {
  async createProduct(data) {
    // Lógica de negócio
    return await this.productRepository.create(data);
  }
}
```

4. **Criar Controller** (`controllers/`):
```typescript
export async function createProduct(req, res) {
  const data = CreateProductDTO.parse(req.body);
  const product = await productService.createProduct(data);
  res.status(201).json(product);
}
```

5. **Criar Rota** (`routes/`):
```typescript
router.post('/', authenticate, createProduct);
```

## Conclusão

A arquitetura oferece:

- Separação clara de responsabilidades
- Facilita testes e manutenção do código
- Escalabilidade e flexibilidade para crescimento
- Type safety em todas as camadas
- Preparação para evoluções futuras
