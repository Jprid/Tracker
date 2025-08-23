export interface AccessTokenPayload {
  userId: number;
  role: string;
}

export interface RefreshTokenPayload {
  userId: number;
}

export interface AuthRequest extends Request {
    user?: AccessTokenPayload;
}

declare module 'express-serve-static-core' {
    interface Request {
        user?: AccessTokenPayload;
    }
}