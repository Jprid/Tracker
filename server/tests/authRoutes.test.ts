import { jest } from '@jest/globals';
import type { Request, Response } from 'express';

// Mock the auth service
jest.mock('../src/services/authService', () => ({
    refreshAccessToken: jest.fn(),
    generateTokens: jest.fn(),
    getTokensForSession: jest.fn()
}));

import { refreshAccessToken, generateTokens, getTokensForSession } from '../src/services/authService';

describe('Auth Routes Logic', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;

    beforeEach(() => {
        jest.clearAllMocks();

        // Mock request/response
        mockReq = {
            body: {},
            cookies: {}
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            cookie: jest.fn().mockReturnThis()
        } as Partial<Response>;
    });

    describe('POST /init logic', () => {
        const initHandler = (req: Request, res: Response) => {
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
        };

        it('should initialize tokens for authenticated user', () => {
            const mockTokens = {
                accessToken: 'access-token-123',
                refreshToken: 'refresh-token-123'
            };

            (mockReq as any).user = { userId: 'user123' };
            (getTokensForSession as jest.Mock).mockReturnValue(null);
            (generateTokens as jest.Mock).mockReturnValue(mockTokens);

            initHandler(mockReq as Request, mockRes as Response);

            expect(getTokensForSession).toHaveBeenCalledWith('user123');
            expect(generateTokens).toHaveBeenCalledWith('user123');
            expect(mockRes.cookie).toHaveBeenCalledWith('refreshToken', 'refresh-token-123', {
                httpOnly: true,
                secure: false, // NODE_ENV is not 'production' in test
                maxAge: 7 * 24 * 60 * 60 * 1000,
                sameSite: 'strict'
            });
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                accessToken: 'access-token-123'
            });
        });

        it('should use existing tokens if available', () => {
            const mockTokens = {
                accessToken: 'existing-access-token',
                refreshToken: 'existing-refresh-token'
            };

            (mockReq as any).user = { userId: 'user123' };
            (getTokensForSession as jest.Mock).mockReturnValue(mockTokens);

            initHandler(mockReq as Request, mockRes as Response);

            expect(getTokensForSession).toHaveBeenCalledWith('user123');
            expect(generateTokens).not.toHaveBeenCalled();
        });

        it('should handle anonymous user', () => {
            const mockTokens = {
                accessToken: 'anonymous-access-token',
                refreshToken: 'anonymous-refresh-token'
            };

            (mockReq as any).user = undefined;
            (getTokensForSession as jest.Mock).mockReturnValue(null);
            (generateTokens as jest.Mock).mockReturnValue(mockTokens);

            initHandler(mockReq as Request, mockRes as Response);

            expect(getTokensForSession).toHaveBeenCalledWith('anonymous');
            expect(generateTokens).toHaveBeenCalledWith('anonymous');
        });
    });

    describe('POST /refresh logic', () => {
        const refreshHandler = (req: Request, res: Response) => {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                res.status(401).json({ success: false, error: 'No refresh token provided' });
                return;
            }

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
        };

        it('should refresh access token successfully', () => {
            const mockTokens = {
                accessToken: 'new-access-token',
                refreshToken: 'new-refresh-token'
            };

            mockReq.cookies = { refreshToken: 'valid-refresh-token' };
            (refreshAccessToken as jest.Mock).mockReturnValue(mockTokens);

            refreshHandler(mockReq as Request, mockRes as Response);

            expect(refreshAccessToken).toHaveBeenCalledWith('valid-refresh-token');
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                accessToken: 'new-access-token'
            });
        });

        it('should return 401 when no refresh token provided', () => {
            mockReq.cookies = {};

            refreshHandler(mockReq as Request, mockRes as Response);

            expect(refreshAccessToken).not.toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'No refresh token provided'
            });
        });

        it('should return 403 when refresh token is invalid', () => {
            mockReq.cookies = { refreshToken: 'invalid-token' };
            (refreshAccessToken as jest.Mock).mockReturnValue(null);

            refreshHandler(mockReq as Request, mockRes as Response);

            expect(refreshAccessToken).toHaveBeenCalledWith('invalid-token');
            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Invalid refresh token'
            });
        });
    });
});
