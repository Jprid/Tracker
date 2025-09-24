import {Router, type Request, type Response} from 'express';
import {refreshAccessToken, generateTokens, getTokensForSession} from "../services/authService.ts";
import {authenticateToken} from "../middleware/authMiddleware.ts";
import { RefreshTokenCookiesSchema, validateCookies } from "../types/validation.ts";
import logger from '../utils/logger.ts';

const router = Router();

router.post('/init', authenticateToken, (req: Request, res: Response) => {
    // Get or create tokens for this session
    const userId = (req as any).user?.userId || 'anonymous';
    let tokens = getTokensForSession(userId);

    if (!tokens) {
        tokens = generateTokens(userId);
    }

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: 'strict'
    });

    res.json({
        success: true,
        accessToken: tokens.accessToken
    });
});

router.post('/refresh', validateCookies(RefreshTokenCookiesSchema), (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        res.status(401).json({ success: false, error: 'No refresh token provided' });
        return;
    }

    logger.debug('Valid refresh token received');
    const tokens = refreshAccessToken(refreshToken);
    if (!tokens) {
        res.status(403).json({ success: false, error: 'Invalid refresh token' });
        return;
    }

    // Update refresh token cookie
    res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: 'strict'
    });

    res.json({
        success: true,
        accessToken: tokens.accessToken
    });
});

export const authRoutes = router;