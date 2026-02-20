/**
 * @project BilheteriaTech
 * @author Dirceu Silva de Oliveira Tech
 * @date 2025-02-20
 * @description Função do processador de webhooks AWS Lambda
 */

import { PrismaClient } from '@prisma/client';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import crypto from 'node:crypto';
import { z } from 'zod';

const webhookSchema = z.object({
  orderId: z.string().min(1),
  paymentId: z.string().min(1),
  status: z.enum(['PAID', 'FAILED']),
});

const prismaClient = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

function signWebhook(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = signWebhook(payload, secret);
  if (signature.length !== expectedSignature.length) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const webhookSecret = process.env.WEBHOOK_SECRET;
  if (!webhookSecret) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'WEBHOOK_SECRET não configurado' }),
    };
  }

  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Body não fornecido' }),
      };
    }

    const rawBody = event.isBase64Encoded
      ? Buffer.from(event.body, 'base64').toString('utf8')
      : event.body;

    const signatureHeader = event.headers['x-signature'] || event.headers['X-Signature'];
    if (!signatureHeader) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Assinatura não fornecida' }),
      };
    }

    const isValidSignature = verifyWebhookSignature(rawBody, signatureHeader, webhookSecret);
    if (!isValidSignature) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Assinatura inválida' }),
      };
    }

    const payload = webhookSchema.parse(JSON.parse(rawBody));

    const existingPayment = await prismaClient.payment.findUnique({
      where: { id: payload.paymentId },
      select: { id: true, orderId: true, status: true },
    });

    if (!existingPayment) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Pagamento não encontrado' }),
      };
    }

    if (existingPayment.orderId !== payload.orderId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'orderId incompatível com paymentId' }),
      };
    }

    if (existingPayment.status === payload.status) {
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, message: 'Webhook já processado (idempotente)' }),
      };
    }

    if (payload.status === 'PAID') {
      await prismaClient.$transaction([
        prismaClient.payment.update({
          where: { id: payload.paymentId },
          data: { status: 'PAID' },
        }),
        prismaClient.order.update({
          where: { id: payload.orderId },
          data: { status: 'PAID' },
        }),
      ]);
    } else if (payload.status === 'FAILED') {
      await prismaClient.payment.update({
        where: { id: payload.paymentId },
        data: { status: 'FAILED' },
      });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erro ao processar webhook' }),
    };
  }
};
