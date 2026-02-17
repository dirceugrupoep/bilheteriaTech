# BilheteriaTech

Sistema de bilheteria com site para o cliente (comprar ingressos), painel para o administrador (CRUD de eventos, pedidos, usuários) e API em Node.js. Toda a documentação de uso, execução local e deploy está neste arquivo e nos links ao final.

---

## O que este projeto contém

- **Site do cliente** (`apps/web`): listar eventos, cadastrar, login, comprar ingresso (pagamento simulado), ver meus pedidos.
- **Painel admin** (`apps/admin`): login admin, dashboard, CRUD de eventos, lista de pedidos e usuários.
- **API** (`services/api`): autenticação (JWT), eventos, pedidos, pagamentos fake e webhook; usa PostgreSQL, RabbitMQ e Redis.
- **Mock de pagamento** (`services/payment-provider-mock`): simula gateway e dispara webhook para a API.

Tudo roda em containers Docker na sua máquina. Na AWS, cada parte é implantada em serviços separados (RDS, EC2, S3, CloudFront, etc.).

---

## Estrutura do repositório

```
bilheteriaTech/
├── README.md                 ← Você está aqui. Documentação principal (local + AWS).
├── QUICKSTART.md             ← Resumo rápido: subir com Docker e testar.
├── ARCHITECTURE.md           ← Visão geral do sistema, componentes e fluxos.
├── .env.example              ← Modelo de variáveis de ambiente (copie para .env).
├── .env                      ← Suas variáveis (não vai pro Git). Crie a partir do .env.example.
├── docker-compose.yml        ← Orquestra todos os serviços no seu PC (local).
│
├── apps/
│   ├── web/                  ← Frontend cliente (React + Vite).
│   │   ├── Dockerfile        ← Build de produção (Nginx).
│   │   └── Dockerfile.dev    ← Desenvolvimento (npm run dev). Usado pelo docker-compose.
│   └── admin/                ← Frontend admin (React + Vite).
│       ├── Dockerfile
│       └── Dockerfile.dev
│
├── services/
│   ├── api/                  ← Backend (Node + Express + Prisma).
│   │   ├── Dockerfile        ← Build de produção da API.
│   │   ├── Dockerfile.dev    ← Desenvolvimento (migrate + seed + npm run dev). Usado pelo docker-compose.
│   │   ├── prisma/           ← Schema do banco, migrations e seed.
│   │   └── ARCHITECTURE.md   ← Detalhes da arquitetura em camadas da API.
│   └── payment-provider-mock/
│       └── Dockerfile        ← Serviço que simula o gateway e chama o webhook.
│
├── docs/
│   └── RABBITMQ_REDIS_SETUP.md   ← Configuração de RabbitMQ e Redis.
│
└── lambda/                   ← Função AWS Lambda (webhook), opcional.
```

---

## Arquivos que fazem o “rodar” e o “deploy”

| Arquivo | O que faz | Por que importa |
|--------|-----------|------------------|
| **docker-compose.yml** (raiz) | Define todos os serviços (postgres, api, payment-mock, web, admin, rabbitmq, redis) e como sobe juntos no seu computador. | É o único arquivo que você precisa para rodar tudo em ambiente local com um comando. |
| **.env** (raiz) | Guarda senhas, URLs e configurações (banco, JWT, RabbitMQ, Redis, etc.). Não é commitado. | Sem ele (ou com valores errados), a API e os apps não conectam no banco nem nos serviços. |
| **.env.example** (raiz) | Lista das variáveis necessárias com exemplos. | Serve de modelo: você copia para `.env` e ajusta (no local já pode vir preenchido). |
| **Dockerfile** em cada app/serviço | Instruções para construir a imagem Docker daquele componente. | No local, o `docker-compose` usa os `Dockerfile.dev` (ou o `Dockerfile` do mock). Na AWS, você usa os `Dockerfile` de produção para build e deploy. |
| **Dockerfile.dev** (api, web, admin) | Imagem pensada para desenvolvimento: código montado por volume, comando `npm run dev`. | Permite ver alterações sem reconstruir a imagem; usado só no ambiente local pelo `docker-compose`. |

- **Local:** o que “faz” rodar é o `docker-compose.yml` + `.env` + os `Dockerfile`/`Dockerfile.dev` referenciados nele.
- **AWS:** não se usa o `docker-compose` da raiz. O deploy é feito com outros arquivos/ferramentas (build das imagens, ECR, EC2, RDS, S3, CloudFront, etc.), conforme o passo a passo abaixo.

---

# Parte 1 — Rodar no seu computador (local)

Objetivo: ter o sistema inteiro funcionando na sua máquina usando Docker. Não é necessário instalar Node, PostgreSQL ou RabbitMQ manualmente.

---

## Passo 1 — Instalar o Docker

1. Acesse [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop).
2. Baixe e instale o **Docker Desktop** para o seu sistema (Windows, Mac ou Linux).
3. Abra o Docker Desktop e espere ele iniciar (ícone na bandeja do sistema).
4. Abra um terminal (PowerShell, CMD ou terminal do VS Code) e digite:
   ```bash
   docker --version
   docker compose version
   ```
   Se os dois comandos mostrarem versão, está pronto.

---

## Passo 2 — Abrir a pasta do projeto

No terminal, vá até a pasta do projeto (onde está o `docker-compose.yml`):

```bash
cd C:\projetos\bilheteriaTech
```

Troque `C:\projetos\bilheteriaTech` pelo caminho real da pasta no seu PC.

---

## Passo 3 — Configurar o arquivo de ambiente (.env)

1. Na pasta raiz do projeto, veja se existe o arquivo **`.env`**.
2. Se **não existir**, copie o modelo:
   - Copie o arquivo **`.env.example`** e renomeie a cópia para **`.env`**.
   - No Windows (PowerShell): `Copy-Item .env.example .env`
   - No Linux/Mac: `cp .env.example .env`
3. Se **já existir** um `.env` pronto para local, você pode deixar como está. Caso queira conferir:
   - Abra o `.env` em um editor de texto.
   - As variáveis devem apontar para os serviços que sobem no Docker (por exemplo `postgres`, `rabbitmq`, `redis` como host). O `.env.example` na raiz já traz exemplos para ambiente local.

Sem o `.env` (ou com valores errados), a API pode falhar ao conectar no banco ou no RabbitMQ.

---

## Passo 4 — Subir todos os serviços com Docker

Ainda na pasta raiz (onde está o `docker-compose.yml`), execute:

```bash
docker compose up --build
```

- **O que isso faz:** lê o `docker-compose.yml`, constrói as imagens que usam `Dockerfile`/`Dockerfile.dev` e sobe os containers (postgres, api, payment-mock, web, admin, rabbitmq, redis).
- **Na primeira vez** pode demorar alguns minutos (download de imagens e instalação de dependências).
- Deixe o terminal aberto; os logs de todos os serviços aparecem aí. Para parar: `Ctrl+C`.

Quando aparecerem mensagens indicando que a API e os frontends subiram (por exemplo “API rodando na porta 3000”), siga para o próximo passo.

---

## Passo 5 — Acessar as aplicações no navegador

Abra o navegador e acesse:

| O quê | URL |
|-------|-----|
| Site do cliente | http://localhost:5173 |
| Painel admin | http://localhost:5174 |
| API (health) | http://localhost:3000/health |

Se a API estiver ok, http://localhost:3000/health deve retornar algo como `{"status":"ok","timestamp":"..."}`.

---

## Passo 6 — Credenciais para testar

**Admin (painel em http://localhost:5174):**

- E-mail: `admin@bilheteriatech.local`
- Senha: `Admin@123`

**Cliente (site em http://localhost:5173):**  
Cadastre um usuário pela própria tela de registro.

**RabbitMQ (interface de gestão):**

- URL: http://localhost:15672  
- Usuário: `admin`  
- Senha: `admin123`  

---

## Passo 7 — Parar os serviços

No terminal onde rodou `docker compose up --build`, pressione **Ctrl+C**.  
Para remover os containers e o volume do banco (voltar ao estado “zerado”):

```bash
docker compose down -v
```

---

## Resumo do fluxo local

1. Docker instalado.  
2. Pasta do projeto aberta no terminal.  
3. Arquivo `.env` criado a partir do `.env.example` (se ainda não existir).  
4. Comando: `docker compose up --build`.  
5. Acessar Web (5173), Admin (5174) e API (3000) no navegador.  

O único arquivo que “dispara” tudo localmente é o **docker-compose.yml**; ele usa os **Dockerfile**/ **Dockerfile.dev** de cada pasta e as variáveis do **.env**.

---

# Parte 2 — Build e deploy na AWS

Aqui o objetivo é colocar o sistema na nuvem AWS: banco em RDS, API (e opcionalmente o mock) em EC2, frontends em S3 + CloudFront. O **docker-compose.yml** da raiz **não é usado** na AWS; cada parte é implantada separadamente.

---

## Visão geral do que será criado na AWS

| Recurso AWS | Uso no BilheteriaTech |
|-------------|------------------------|
| **VPC e subnets** | Rede isolada para RDS, EC2, etc. |
| **RDS (PostgreSQL)** | Banco de dados da API. |
| **EC2** | Servidor onde rodam a API e o payment-mock (por exemplo com Docker ou Docker Compose só da API+mock). |
| **S3** | Dois buckets: um para o build do site (web), outro para o build do admin. |
| **CloudFront** | CDN em frente aos buckets; entrega o site e o admin com HTTPS. |
| **IAM** | Usuário/role com permissões mínimas para deploy (EC2, S3, CloudFront, RDS se necessário). |
| **Lambda** (opcional) | Função para processar webhook; pode ficar em paralelo ao processamento na API. |

---

## Passo 1 — Conta AWS e IAM

1. Entre no console da AWS e ative **MFA** na conta (recomendado).
2. Crie um **usuário IAM** só para deploy (ex.: `bilheteriatech-deployer`).
3. Crie uma **policy** com permissão mínima, por exemplo:
   - S3: PutObject, GetObject, ListBucket (para os buckets dos frontends).
   - CloudFront: CreateInvalidation (para invalidar cache após deploy).
   - EC2: DescribeInstances, SendCommand (SSM) ou SSH, conforme você for usar.
4. Atribua essa policy ao usuário.
5. Crie uma **Access Key** para esse usuário e guarde o **Access Key ID** e o **Secret Access Key** em local seguro (por exemplo em segredos do GitHub Actions, se for usar CI/CD).

---

## Passo 2 — VPC e rede

1. No console AWS, vá em **VPC**.
2. Crie uma **VPC** (ex.: `bilheteriaTech-vpc`) com um bloco CIDR, por exemplo `10.0.0.0/16`.
3. Crie **subnets**:
   - Duas **públicas** (ex.: `10.0.1.0/24` e `10.0.2.0/24`) para cargas que precisam de IP público.
   - Duas **privadas** (ex.: `10.0.11.0/24` e `10.0.12.0/24`) para o RDS (e opcionalmente para a EC2, se quiser).
4. Crie **Internet Gateway**, associe à VPC e configure **route tables** nas subnets públicas para usar esse gateway.
5. Se a EC2 estiver em subnet privada, crie **NAT Gateway** em subnet pública e rotas nas subnets privadas para saída pela NAT.

---

## Passo 3 — RDS (PostgreSQL)

1. No console AWS, abra **RDS** e crie um **banco PostgreSQL**.
2. Escolha a **VPC** e as **subnets** (de preferência as privadas).
3. Crie um **Security Group** para o RDS (ex.: `bilheteriatech-rds-sg`) e libere a porta **5432** apenas para o Security Group da EC2 (e da Lambda, se for usar). Não exponha 5432 para a internet.
4. Crie o banco com usuário e senha fortes; anote a **URL de conexão** (host, porta, nome do banco). Exemplo: `postgresql://usuario:senha@seu-rds.region.rds.amazonaws.com:5432/bilheteriatech`.
5. Recomendado: guardar usuário e senha no **AWS Systems Manager Parameter Store** (tipo SecureString) e usar na EC2 ou no CI/CD.

---

## Passo 4 — EC2 (API e payment-mock)

1. Crie uma instância **EC2** (Amazon Linux 2 ou 2023, por exemplo).
2. Associe à **VPC** e a uma **subnet** (pública se for acessar a API pela internet).
3. Configure o **Security Group** da EC2:
   - Porta **22** (SSH) apenas do seu IP, ou use **AWS Systems Manager Session Manager** e não abra a 22.
   - Portas **80** e **443** para tráfego público (se a API for exposta direto; em produção é comum usar um Load Balancer).
4. Instale **Docker** e **Docker Compose** na EC2 (via user data ou manualmente).
5. **Build e deploy da API e do mock:**
   - No seu PC ou em um pipeline (ex.: GitHub Actions):
     - Build da imagem da API: na pasta `services/api`, usando o **Dockerfile** (não o Dockerfile.dev). Ex.: `docker build -t bilheteriatech-api ./services/api`
     - Build da imagem do mock: `docker build -t bilheteriatech-mock ./services/payment-provider-mock`
   - Envie as imagens para o **ECR** (Elastic Container Registry) da AWS ou copie os arquivos do projeto para a EC2 e faça o build lá.
   - Na EC2, use um **docker-compose** só da API + mock (arquivo separado do da raiz), apontando `DATABASE_URL` para o RDS e variáveis de produção (JWT, WEBHOOK_SECRET, etc.). Exemplo de comando na EC2: `docker compose -f docker-compose.prod.yml up -d`.
6. Configure um **Nginx** (ou outro proxy) na EC2 para encaminhar as requisições (ex.: porta 80) para o container da API (porta 3000). O mock pode ficar só acessível internamente.

Os arquivos que “fazem” o build da API e do mock na AWS são os **Dockerfile** (não os Dockerfile.dev) em `services/api` e `services/payment-provider-mock`.

---

## Passo 5 — S3 e CloudFront (frontends)

1. Crie **dois buckets** no S3, por exemplo: `bilheteriatech-web` e `bilheteriatech-admin`.
2. Configure os buckets para **não** acesso público direto (acesso apenas via CloudFront).
3. **Build dos frontends** no seu PC (ou no CI):
   - Site cliente: `cd apps/web && npm ci && npm run build` (saída em `dist/`).
   - Admin: `cd apps/admin && npm ci && npm run build` (saída em `dist/`).
4. **Envie** o conteúdo de cada `dist/` para o bucket correspondente (por exemplo com `aws s3 sync apps/web/dist s3://bilheteriatech-web --delete` e o mesmo para o admin).
5. Crie **duas distribuições no CloudFront**:
   - Uma com origin no bucket do **web** e outra no bucket do **admin**.
   - Em cada uma, configure o **default root object** como `index.html` e um **error page** (403/404) redirecionando para `index.html` com código 200 (para SPA).
   - Ative **HTTPS** (certificado padrão da CloudFront ou ACM).
6. (Opcional) Configure **domínios** (ex.: `web.seudominio.com` e `admin.seudominio.com`) apontando para as URLs do CloudFront.

Os arquivos que “fazem” o build para a AWS são os **Dockerfile** (ou apenas `npm run build`) em `apps/web` e `apps/admin`; o deploy em si é o upload para S3 + invalidação no CloudFront.

---

## Passo 6 — Variáveis de ambiente na AWS

Na EC2 (ou no arquivo que o docker-compose da produção usa), configure pelo menos:

- `DATABASE_URL`: URL do RDS (PostgreSQL).
- `JWT_SECRET`, `ADMIN_JWT_SECRET`, `WEBHOOK_SECRET`: valores fortes e únicos.
- `PAYMENT_MOCK_URL`: URL interna do mock (ex.: `http://payment-mock:4000` se estiver no mesmo compose).
- `API_BASE_URL`: URL pública da API (ex.: `https://api.seudominio.com`).
- `CORS_ORIGIN`: origens dos frontends (ex.: `https://web.seudominio.com,https://admin.seudominio.com`).
- Se usar RabbitMQ/Redis na AWS, `RABBITMQ_URL` e `REDIS_URL` conforme o serviço que você criar.

---

## Passo 7 — CI/CD (opcional)

- **GitHub Actions** (ou outro CI):
  - **Frontends:** em cada push na branch principal, rodar `npm run build`, enviar o `dist/` para o S3 e criar uma **invalidação** no CloudFront.
  - **API:** build da imagem Docker, push para o ECR e atualização do serviço na EC2 (ou ECS, se migrar depois).

Os arquivos do repositório que o CI usa para **build** são os mesmos: `Dockerfile` em `services/api`, `apps/web`, `apps/admin` e o `package.json`/scripts de cada um.

---

## Resumo do que faz o quê na AWS

| O quê | Arquivo / recurso | Por quê |
|-------|-------------------|--------|
| Banco de dados | RDS (PostgreSQL) | A API usa Prisma e precisa de um PostgreSQL; o RDS é gerenciado e fica em rede privada. |
| API e mock | `services/api/Dockerfile`, `services/payment-provider-mock/Dockerfile` | Build das imagens que rodam na EC2 (ou ECS). |
| Site e admin | `apps/web` e `apps/admin` + `npm run build` | Gera os arquivos estáticos que vão para S3 e são servidos pelo CloudFront. |
| Orquestração local | `docker-compose.yml` (raiz) | **Não é usado na AWS.** Só para desenvolvimento no seu PC. |

---

# Referência rápida — API

- **Health:** `GET /health`
- **Auth:** `POST /auth/register`, `POST /auth/login`, `POST /auth/admin/login`
- **Eventos:** `GET/POST /events`, `GET/PUT/DELETE /events/:id`
- **Pedidos:** `POST /orders`, `GET /orders/me/orders`, `GET /orders/admin/orders`, `GET /orders/:id`
- **Pagamentos:** `POST /payments/fake`
- **Webhook:** `POST /webhooks/payment` (header `x-signature` com HMAC do body)
- **Usuários (admin):** `GET /admin/users`

Autenticação: header `Authorization: Bearer <token>`.

Variáveis principais da API: `DATABASE_URL`, `JWT_SECRET`, `ADMIN_JWT_SECRET`, `WEBHOOK_SECRET`, `PAYMENT_MOCK_URL`, `API_BASE_URL`, `CORS_ORIGIN`; opcionais: `QUEUE_TYPE`, `RABBITMQ_URL`, `REDIS_URL`. Lista completa e descrição estão no [ARCHITECTURE.md](ARCHITECTURE.md).

---

# Documentação — outros arquivos

Toda a documentação fica na raiz ou em pastas referenciadas aqui:

| Arquivo | Conteúdo |
|---------|----------|
| [README.md](README.md) | Este arquivo: visão do projeto, rodar local (passo a passo), build e deploy na AWS (passo a passo), arquivos que fazem o quê, referência da API e links. |
| [QUICKSTART.md](QUICKSTART.md) | Resumo rápido para subir com Docker, acessar as URLs, credenciais e testar o fluxo (cliente e admin). |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Arquitetura do sistema: componentes (web, admin, API, mock), fluxo de pagamento, segurança, banco, variáveis de ambiente e observabilidade. |
| [docs/RABBITMQ_REDIS_SETUP.md](docs/RABBITMQ_REDIS_SETUP.md) | Configuração e uso de RabbitMQ e Redis no projeto. |
| [services/api/ARCHITECTURE.md](services/api/ARCHITECTURE.md) | Arquitetura em camadas da API (controllers, services, repositories, DTOs, padrões). |

Não há outro README dentro de pastas: a documentação principal é este **README.md** na raiz. Use os links acima para aprofundar em cada tema.
