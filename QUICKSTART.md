# Quick Start - BilheteriaTech

## Início Rápido (5 minutos)

### 1. Pré-requisitos
- Docker e Docker Compose instalados
- Git (opcional)

### 2. Configuração Inicial

```bash
# Clone ou navegue até o diretório do projeto
cd bilheteriaTech

# Copie o arquivo de ambiente
cp .env.example .env

# (Opcional) Edite o .env se necessário
```

### 3. Iniciar o Projeto

```bash
# Subir todos os serviços
docker compose up --build

# Aguarde alguns segundos para:
# - PostgreSQL iniciar
# - Migrations executarem
# - Seed popular o banco
# - Todos os serviços ficarem prontos
```

### 4. Acessar as Aplicações

- **Web (Cliente)**: http://localhost:5173
- **Admin**: http://localhost:5174
- **API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

### 5. Credenciais Padrão

**Admin:**
- Email: `admin@bilheteriatech.local`
- Senha: `Admin@123`

**Cliente:**
- Crie uma conta através da interface web

## Testar o Fluxo Completo

### Como Cliente:

1. Acesse http://localhost:5173
2. Cadastre-se ou faça login
3. Escolha um evento
4. Selecione a quantidade de ingressos
5. Clique em "Comprar"
6. O pagamento fake será processado automaticamente
7. Aguarde 1-2 segundos para o webhook confirmar
8. Veja seu pedido em "Meus Pedidos"

### Como Admin:

1. Acesse http://localhost:5174
2. Faça login com as credenciais admin
3. Veja o dashboard com estatísticas
4. Crie/edite/delete eventos em "Eventos"
5. Veja todos os pedidos em "Pedidos"
6. Veja usuários cadastrados em "Usuários"

## Comandos Úteis

```bash
# Ver logs de todos os serviços
docker compose logs -f

# Ver logs de um serviço específico
docker compose logs -f api

# Parar todos os serviços
docker compose down

# Parar e remover volumes (limpar banco)
docker compose down -v

# Rebuild de um serviço específico
docker compose build api
docker compose up api

# Executar migrations manualmente
docker compose exec api npm run prisma:migrate

# Executar seed manualmente
docker compose exec api npm run prisma:seed

# Acessar shell do container da API
docker compose exec api sh

# Acessar PostgreSQL
docker compose exec postgres psql -U postgres -d bilheteriatech
```

## Problemas Comuns

### Porta já em uso
```bash
# Verifique o que está usando a porta
# Windows: netstat -ano | findstr :3000
# Linux/Mac: lsof -i :3000

# Pare o processo ou altere a porta no docker-compose.yml
```

### Banco não conecta
```bash
# Verifique se o PostgreSQL está rodando
docker compose ps

# Reinicie o serviço
docker compose restart postgres

# Verifique os logs
docker compose logs postgres
```

### Migrations não executam
```bash
# Execute manualmente
docker compose exec api npm run prisma:migrate
docker compose exec api npm run prisma:seed
```

### Frontend não carrega
```bash
# Verifique se a API está respondendo
curl http://localhost:3000/health

# Verifique os logs
docker compose logs web
docker compose logs api
```


## Dicas

- Use `docker compose up -d` para rodar em background
- Os frontends têm hot reload - edite e veja as mudanças
- A API tem hot reload com tsx watch
- Todos os logs são coloridos em desenvolvimento
- O banco persiste dados em volume Docker
