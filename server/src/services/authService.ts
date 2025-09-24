import jwt from 'jsonwebtoken';
import logger from '../utils/logger.ts';

// In-memory token storage (in production, use Redis or database)
const tokenStore = new Map<string, { accessToken: string; refreshToken: string; expiresAt: number }>();

export function generateTokens(userId?: string): { accessToken: string; refreshToken: string } {
    const payload = userId ? { userId } : {};
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '7d' });

    // Store tokens in memory with expiration
    const sessionId = userId || 'anonymous';
    tokenStore.set(sessionId, {
        accessToken,
        refreshToken,
        expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
    });

    logger.info({ sessionId }, 'New tokens generated for session');
    return { accessToken, refreshToken };
}

export function refreshAccessToken(providedRefreshToken: string): { accessToken: string; refreshToken: string } | null {
    if (!providedRefreshToken) {
        return null;
    }

    try {
        // Find the session that owns this refresh token
        let sessionId: string | undefined;
        for (const [id, tokens] of tokenStore.entries()) {
            if (tokens.refreshToken === providedRefreshToken) {
                sessionId = id;
                break;
            }
        }

        if (!sessionId) {
            return null;
        }

        jwt.verify(providedRefreshToken, process.env.JWT_SECRET!);

        // Generate new access token
        const payload = sessionId !== 'anonymous' ? { userId: sessionId } : {};
        const newAccessToken = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '15m' });

        // Update stored tokens
        const currentTokens = tokenStore.get(sessionId)!;
        tokenStore.set(sessionId, {
            ...currentTokens,
            accessToken: newAccessToken
        });

        return { accessToken: newAccessToken, refreshToken: providedRefreshToken };
    } catch (err) {
        logger.error({ err }, 'Invalid refresh token');
        return null;
    }
}

export function getTokensForSession(sessionId: string = 'anonymous'): { accessToken: string; refreshToken: string } | null {
    const tokens = tokenStore.get(sessionId);
    if (!tokens || tokens.expiresAt < Date.now()) {
        return null;
    }
    return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
}

export function invalidateSession(sessionId: string): void {
    tokenStore.delete(sessionId);
}

// Test helper function to clear token store
export function clearTokenStore(): void {
    tokenStore.clear();
}
