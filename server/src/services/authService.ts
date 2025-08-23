import jwt from 'jsonwebtoken';
import type { AccessTokenPayload, RefreshTokenPayload } from '../types/auth.ts';

let currentAccessToken: string | null = null;
let refreshToken: string | null = null;

export function generateTokens(userId: number = 123, role: string = 'admin'): { accessToken: string; refreshToken: string } {
    const accessPayload: AccessTokenPayload = { userId, role };
    const refreshPayload: RefreshTokenPayload = { userId };

    const accessToken = jwt.sign(accessPayload, process.env.JWT_SECRET!, { expiresIn: '15m' });
    const currentRefreshToken = jwt.sign(refreshPayload, process.env.JWT_SECRET!, { expiresIn: '7d' });

    currentAccessToken = accessToken;
    refreshToken = currentRefreshToken;
    return { accessToken, refreshToken };
}

export function refreshAccessToken(providedRefreshToken: string): { accessToken: string; refreshToken: string } | null {
    if (!providedRefreshToken) {
        return null;
    }

    try {
        const decoded = jwt.verify(providedRefreshToken, process.env.JWT_SECRET!) as RefreshTokenPayload;
        const newAccessToken = jwt.sign({ userId: decoded.userId, role: 'admin' }, process.env.JWT_SECRET!, { expiresIn: '15m' });
        currentAccessToken = newAccessToken;
        console.log('Access token refreshed:', newAccessToken);
        return { accessToken: newAccessToken, refreshToken: providedRefreshToken };
    } catch (err) {
        console.error('Invalid refresh token, generating new tokens', err);
        return generateTokens();
    }
}

// Initialize tokens on startup
const initialTokens = generateTokens();
currentAccessToken = initialTokens.accessToken;
refreshToken = initialTokens.refreshToken;
console.log('Initial access token:', currentAccessToken);

// Auto-refresh access token every 10 minutes
setInterval(() => {
    if (refreshToken) {
        refreshAccessToken(refreshToken);
    }
}, 10 * 60 * 1000);