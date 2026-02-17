export interface JWTPayload {
  userId: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export interface RequestWithUser extends Express.Request {
  user?: JWTPayload;
}
