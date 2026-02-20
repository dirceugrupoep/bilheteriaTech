# Webhook Processor Lambda

Função Lambda para processar webhooks de pagamento de forma assíncrona.

## O que ela faz

- valida assinatura HMAC (`x-signature`) usando `WEBHOOK_SECRET`
- valida payload (`orderId`, `paymentId`, `status`)
- aplica atualização idempotente de `payment` e `order`

## Variáveis de ambiente

- `DATABASE_URL` (obrigatória)
- `WEBHOOK_SECRET` (obrigatória, mínimo recomendado 32 caracteres)

## Build local

```bash
cd lambda/webhook-processor
npm install
npm run package
```

## Contrato de entrada (API Gateway)

- `body`: JSON com `orderId`, `paymentId`, `status` (`PAID` ou `FAILED`)
- header obrigatório: `x-signature` com HMAC SHA256 do corpo bruto

## Observações

- esta Lambda usa Prisma Client e precisa de acesso ao banco (RDS)
- para produção em AWS, execute dentro de VPC/subnets com acesso ao SG do RDS
