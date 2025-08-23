import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { AccessTokenPayload } from '../types/auth.ts';

export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        res.status(401).send('No token provided');
        return;
    }

    jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
        if (err) {
            res.status(403).send('Invalid or expired token');
            return;
        }
        req.user = user as AccessTokenPayload;
        next();
    });
}