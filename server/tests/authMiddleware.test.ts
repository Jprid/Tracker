import { jest } from '@jest/globals';
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticateToken } from '../src/middleware/authMiddleware.ts';

// Mock jwt with factory function to avoid hoisting issues
jest.mock('jsonwebtoken', () => {
    const mockVerify = jest.fn();
    return {
        verify: mockVerify,
        default: {
            verify: mockVerify
        }
    };
});

// Get the mocked function
const mockJwtVerify = (jwt.verify as any) as jest.Mock;

describe('AuthMiddleware', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
        mockReq = {
            headers: {}
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis()
        } as Partial<Response>;
        mockNext = jest.fn();
        mockJwtVerify.mockClear();

        // Set up environment
        process.env.JWT_SECRET = 'test-secret';
    });

    afterEach(() => {
        delete process.env.JWT_SECRET;
    });

    describe('authenticateToken', () => {
        it('should return 401 when no authorization header is provided', () => {
            authenticateToken(mockReq as Request, mockRes as Response, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.send).toHaveBeenCalledWith('No token provided');
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should return 401 when authorization header does not contain Bearer token', () => {
            mockReq.headers = {
                authorization: 'InvalidTokenFormat'
            };

            authenticateToken(mockReq as Request, mockRes as Response, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.send).toHaveBeenCalledWith('No token provided');
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should return 403 when token verification fails', () => {
            mockReq.headers = {
                authorization: 'Bearer invalid-token'
            };

            mockJwtVerify.mockImplementation((token, secret, callback) => {
                (callback as any)(new Error('Invalid token'), null);
            });

            authenticateToken(mockReq as Request, mockRes as Response, mockNext);

            expect(mockJwtVerify).toHaveBeenCalledWith('invalid-token', 'test-secret', expect.any(Function));
            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.send).toHaveBeenCalledWith('Invalid or expired token');
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should call next and set req.user when token is valid', () => {
            const mockUser = { userId: 'user123' };
            mockReq.headers = {
                authorization: 'Bearer valid-token'
            };

            mockJwtVerify.mockImplementation((token, secret, callback) => {
                (callback as any)(null, mockUser);
            });

            authenticateToken(mockReq as Request, mockRes as Response, mockNext);

            expect(mockJwtVerify).toHaveBeenCalledWith('valid-token', 'test-secret', expect.any(Function));
            expect(mockReq.user).toEqual(mockUser);
            expect(mockNext).toHaveBeenCalled();
            expect(mockRes.status).not.toHaveBeenCalled();
            expect(mockRes.send).not.toHaveBeenCalled();
        });

        it('should handle anonymous user token', () => {
            const mockUser = {};
            mockReq.headers = {
                authorization: 'Bearer anonymous-token'
            };

            mockJwtVerify.mockImplementation((token, secret, callback) => {
                (callback as any)(null, mockUser);
            });

            authenticateToken(mockReq as Request, mockRes as Response, mockNext);

            expect(mockJwtVerify).toHaveBeenCalledWith('anonymous-token', 'test-secret', expect.any(Function));
            expect(mockReq.user).toEqual(mockUser);
            expect(mockNext).toHaveBeenCalled();
        });
    });
});
