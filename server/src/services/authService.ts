import jwt, {type JwtPayload} from 'jsonwebtoken';
import type { AccessTokenPayload, RefreshTokenPayload } from '../types/auth.ts';

let currentAccessToken: string | null = null;
let refreshToken: string | null = null;

export function generateTokens(userId: number = 123, role: string = 'admin'): { accessToken: string; refreshToken: string } {
    if (process.env.ACCESS_TOKEN && process.env.REFRESH_TOKEN) {
        const token = jwt.decode(process.env.ACCESS_TOKEN);
        if (token && ((token as JwtPayload)!.exp!) < Date.now() / 1000) {
            return {
                accessToken: process.env.ACCESS_TOKEN,
                refreshToken: process.env.REFRESH_TOKEN,
            };
        } else {
            console.warn('Token is invalid or expired, generating new tokens');
        }
    }
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