#!/bin/bash

echo "Configurando BilheteriaTech..."

# Copiar .env.example para .env se não existir
if [ ! -f .env ]; then
    echo "Criando arquivo .env..."
    cp .env.example .env
    echo "Arquivo .env criado. Edite se necessário."
else
    echo "Arquivo .env já existe."
fi

# Instalar dependências
echo "Instalando dependências..."
npm install

# Gerar Prisma Client
echo "Gerando Prisma Client..."
cd services/api
npm run prisma:generate
cd ../..

echo "Setup concluído!"
echo ""
echo "Para iniciar o projeto, execute:"
echo "  docker compose up --build"
