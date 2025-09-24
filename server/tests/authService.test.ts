import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import {
    generateTokens,
    refreshAccessToken,
    getTokensForSession,
    invalidateSession,
    clearTokenStore
} from '../src/services/authService.ts';

// Mock jwt with factory function to avoid hoisting issues
jest.mock('jsonwebtoken', () => {
    const mockSign = jest.fn();
    const mockVerify = jest.fn();
    return {
        sign: mockSign,
        verify: mockVerify,
        default: {
            sign: mockSign,
            verify: mockVerify
        }
    };
});

// Get the mocked functions
const mockJwtSign = (jwt.sign as any) as jest.Mock;
const mockJwtVerify = (jwt.verify as any) as jest.Mock;

// Mock process.env
const originalEnv = process.env;
beforeEach(() => {
    process.env = { ...originalEnv, JWT_SECRET: 'test-secret-key' };
    // Clear token store before each test
    clearTokenStore();
    jest.clearAllMocks();
});

afterEach(() => {
    process.env = originalEnv;
});

describe('AuthService', () => {
    describe('generateTokens', () => {
        it('should generate tokens for a user', () => {
            const mockAccessToken = 'mock-access-token';
            const mockRefreshToken = 'mock-refresh-token';

            mockJwtSign.mockReturnValueOnce(mockAccessToken);
            mockJwtSign.mockReturnValueOnce(mockRefreshToken);

            const result = generateTokens('user123');

            expect(result).toEqual({
                accessToken: mockAccessToken,
                refreshToken: mockRefreshToken
            });

            expect(mockJwtSign).toHaveBeenCalledTimes(2);
            expect(mockJwtSign).toHaveBeenNthCalledWith(1, { userId: 'user123' }, 'test-secret-key', { expiresIn: '15m' });
            expect(mockJwtSign).toHaveBeenNthCalledWith(2, { userId: 'user123' }, 'test-secret-key', { expiresIn: '7d' });
        });

        it('should generate tokens for anonymous user', () => {
            const mockAccessToken = 'mock-access-token';
            const mockRefreshToken = 'mock-refresh-token';

            mockJwtSign.mockReturnValueOnce(mockAccessToken);
            mockJwtSign.mockReturnValueOnce(mockRefreshToken);

            const result = generateTokens();

            expect(result).toEqual({
                accessToken: mockAccessToken,
                refreshToken: mockRefreshToken
            });

            expect(mockJwtSign).toHaveBeenCalledTimes(2);
            expect(mockJwtSign).toHaveBeenNthCalledWith(1, {}, 'test-secret-key', { expiresIn: '15m' });
            expect(mockJwtSign).toHaveBeenNthCalledWith(2, {}, 'test-secret-key', { expiresIn: '7d' });
        });
    });

    describe('refreshAccessToken', () => {
        it('should return null for empty refresh token', () => {
            const result = refreshAccessToken('');
            expect(result).toBeNull();
        });

        it('should return null for invalid refresh token', () => {
            // First generate tokens to populate store
            mockJwtSign.mockReturnValueOnce('access-token');
            mockJwtSign.mockReturnValueOnce('invalid-token');
            generateTokens('user123');

            mockJwtVerify.mockImplementation(() => {
                throw new Error('Invalid token');
            });

            const result = refreshAccessToken('invalid-token');
            expect(result).toBeNull();
            expect(mockJwtVerify).toHaveBeenCalledWith('invalid-token', 'test-secret-key');
        });

        it('should refresh tokens successfully', () => {
            const mockRefreshToken = 'valid-refresh-token';
            const mockNewAccessToken = 'new-access-token';

            // First generate tokens to populate store
            mockJwtSign.mockReturnValueOnce('old-access-token');
            mockJwtSign.mockReturnValueOnce(mockRefreshToken);
            mockJwtSign.mockReturnValueOnce(mockNewAccessToken);

            generateTokens('user123');

            mockJwtVerify.mockReturnValue({ userId: 'user123' });

            const result = refreshAccessToken(mockRefreshToken);

            expect(result).toEqual({
                accessToken: mockNewAccessToken,
                refreshToken: mockRefreshToken
            });

            expect(mockJwtVerify).toHaveBeenCalledWith(mockRefreshToken, 'test-secret-key');
            expect(mockJwtSign).toHaveBeenCalledWith({ userId: 'user123' }, 'test-secret-key', { expiresIn: '15m' });
        });
    });

    describe('getTokensForSession', () => {
        it('should return null for non-existent session', () => {
            const result = getTokensForSession('non-existent');
            expect(result).toBeNull();
        });

        it('should return tokens for valid session', () => {
            const mockAccessToken = 'access-token';
            const mockRefreshToken = 'refresh-token';

            mockJwtSign.mockReturnValueOnce(mockAccessToken);
            mockJwtSign.mockReturnValueOnce(mockRefreshToken);

            generateTokens('user123');

            const result = getTokensForSession('user123');

            expect(result).toEqual({
                accessToken: mockAccessToken,
                refreshToken: mockRefreshToken
            });
        });

        it('should return null for expired session', () => {
            const mockAccessToken = 'access-token';
            const mockRefreshToken = 'refresh-token';

            mockJwtSign.mockReturnValueOnce(mockAccessToken);
            mockJwtSign.mockReturnValueOnce(mockRefreshToken);

            generateTokens('user123');

            // Mock Date.now globally after generating tokens to simulate expiration
            const originalDateNow = Date.now;
            const futureTime = originalDateNow() + (8 * 24 * 60 * 60 * 1000); // 8 days in the future
            global.Date.now = jest.fn(() => futureTime);

            const result = getTokensForSession('user123');
            expect(result).toBeNull();

            // Restore Date.now
            global.Date.now = originalDateNow;
        });
    });

    describe('invalidateSession', () => {
        it('should remove session from store', () => {
            mockJwtSign.mockReturnValueOnce('access-token');
            mockJwtSign.mockReturnValueOnce('refresh-token');

            generateTokens('user123');

            expect(getTokensForSession('user123')).not.toBeNull();

            invalidateSession('user123');

            expect(getTokensForSession('user123')).toBeNull();
        });
    });
});
