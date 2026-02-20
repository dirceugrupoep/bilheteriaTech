/**
 * @project BilheteriaTech
 * @author Dirceu Silva de Oliveira Tech
 * @date 2025-02-17
 * @description Tipos TypeScript relacionados a autenticação
 */

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export interface RequestWithUser extends Express.Request {
  user?: JWTPayload;
}
