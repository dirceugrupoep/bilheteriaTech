import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  ADMIN_JWT_SECRET: z.string().min(1),
  WEBHOOK_SECRET: z.string().min(1),
  PAYMENT_MOCK_URL: z.string().url(),
  API_BASE_URL: z.string().url().optional().default('http://localhost:3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
});

export const env = envSchema.parse(process.env);
