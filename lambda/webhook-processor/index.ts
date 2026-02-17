/**
 * @project BilheteriaTech
 * @author Dirceu Silva de Oliveira Tech
 * @date 2026-02-17
 * @description Função Lambda AWS para processamento assíncrono de webhooks de pagamento do sistema de bilheteria, atualizando status de pedidos e pagamentos.
 */
import { PrismaClient } from '@prisma/client';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Body não fornecido' }),
      };
    }

    const { orderId, paymentId, status } = JSON.parse(event.body);

    if (!orderId || !paymentId || !status) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Dados incompletos' }),
      };
    }

    if (status === 'PAID') {
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: paymentId },
          data: { status: 'PAID' },
        }),
        prisma.order.update({
          where: { id: orderId },
          data: { status: 'PAID' },
        }),
      ]);
    } else if (status === 'FAILED') {
      await prisma.payment.update({
        where: { id: paymentId },
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
  } finally {
    await prisma.$disconnect();
  }
};
