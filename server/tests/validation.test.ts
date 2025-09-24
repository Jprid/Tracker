import { jest } from '@jest/globals';
import { z } from 'zod';
import {
    validateBody,
    validateParams,
    validateQuery,
    validateCookies,
    CreateEntrySchema,
    UpdateEntrySchema,
    DeleteEntrySchema,
    CreateHabitEntrySchema,
    RefreshTokenCookiesSchema
} from '../src/types/validation.ts';

describe('Validation Middleware', () => {
    let mockReq: any;
    let mockRes: any;
    let mockNext: jest.Mock;

    beforeEach(() => {
        mockReq = {
            body: {},
            params: {},
            query: {},
            cookies: {}
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        mockNext = jest.fn();
    });

    describe('validateBody', () => {
        it('should call next when validation passes', () => {
            const middleware = validateBody(CreateEntrySchema);
            mockReq.body = { text: 'Valid entry text', completed: true };

            middleware(mockReq, mockRes, mockNext);

            expect(mockReq.body).toEqual({ text: 'Valid entry text', completed: true });
            expect(mockNext).toHaveBeenCalled();
            expect(mockRes.status).not.toHaveBeenCalled();
        });

        it('should return 400 when validation fails', () => {
            const middleware = validateBody(CreateEntrySchema);
            mockReq.body = { text: '', completed: 'not-a-boolean' };

            middleware(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Validation failed',
                details: expect.any(Array)
            });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should handle non-Zod errors', () => {
            const invalidSchema = z.object({ test: z.string() });
            const middleware = validateBody(invalidSchema);
            mockReq.body = null; // This will cause a non-Zod error

            middleware(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(400); // Zod will still catch this
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Validation failed',
                details: expect.any(Array)
            });
        });
    });

    describe('validateParams', () => {
        it('should validate and parse params successfully', () => {
            const testSchema = z.object({
                id: z.string().transform(val => parseInt(val))
            });
            const middleware = validateParams(testSchema);
            mockReq.params = { id: '123' };

            middleware(mockReq, mockRes, mockNext);

            expect(mockReq.params).toEqual({ id: 123 });
            expect(mockNext).toHaveBeenCalled();
        });

        it('should return validation error for invalid params', () => {
            const testSchema = z.object({
                id: z.number().int().positive()
            });
            const middleware = validateParams(testSchema);
            mockReq.params = { id: 'invalid' };

            middleware(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Validation failed',
                details: expect.any(Array)
            });
        });
    });

    describe('validateQuery', () => {
        it('should validate and parse query parameters', () => {
            const testSchema = z.object({
                limit: z.string().transform(val => parseInt(val)).optional()
            });
            const middleware = validateQuery(testSchema);
            mockReq.query = { limit: '10' };

            middleware(mockReq, mockRes, mockNext);

            expect(mockReq.query).toEqual({ limit: 10 });
            expect(mockNext).toHaveBeenCalled();
        });

        it('should handle optional query parameters', () => {
            const testSchema = z.object({
                search: z.string().optional()
            });
            const middleware = validateQuery(testSchema);
            mockReq.query = {};

            middleware(mockReq, mockRes, mockNext);

            expect(mockReq.query).toEqual({});
            expect(mockNext).toHaveBeenCalled();
        });
    });

    describe('validateCookies', () => {
        it('should validate cookies successfully', () => {
            const middleware = validateCookies(RefreshTokenCookiesSchema);
            mockReq.cookies = { refreshToken: 'valid-token' };

            middleware(mockReq, mockRes, mockNext);

            expect(mockReq.cookies).toEqual({ refreshToken: 'valid-token' });
            expect(mockNext).toHaveBeenCalled();
        });

        it('should return error for missing required cookies', () => {
            const middleware = validateCookies(RefreshTokenCookiesSchema);
            mockReq.cookies = {};

            middleware(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Validation failed',
                details: expect.arrayContaining([
                    expect.objectContaining({
                        field: 'refreshToken',
                        message: 'Required'
                    })
                ])
            });
        });
    });
});

describe('Validation Schemas', () => {
    describe('CreateEntrySchema', () => {
        it('should validate valid entry data', () => {
            const validData = { text: 'Valid entry text', completed: true };
            const result = CreateEntrySchema.parse(validData);
            expect(result).toEqual(validData);
        });

        it('should set default completed to false', () => {
            const dataWithoutCompleted = { text: 'Valid entry text' };
            const result = CreateEntrySchema.parse(dataWithoutCompleted);
            expect(result).toEqual({ text: 'Valid entry text', completed: false });
        });

        it('should reject empty text', () => {
            expect(() => CreateEntrySchema.parse({ text: '' })).toThrow();
        });

        it('should reject text too long', () => {
            const longText = 'a'.repeat(1001);
            expect(() => CreateEntrySchema.parse({ text: longText })).toThrow();
        });
    });

    describe('UpdateEntrySchema', () => {
        it('should validate valid update data', () => {
            const validData = {
                id: 123,
                text: 'Updated text',
                completed: true,
                completed_at: '2024-01-01T10:00:00Z'
            };
            const result = UpdateEntrySchema.parse(validData);
            expect(result).toEqual(validData);
        });

        it('should reject invalid ID', () => {
            expect(() => UpdateEntrySchema.parse({
                id: -1,
                text: 'Valid text',
                completed: false
            })).toThrow();
        });

        it('should allow null completed_at', () => {
            const dataWithNull = {
                id: 123,
                text: 'Valid text',
                completed: false,
                completed_at: null
            };
            const result = UpdateEntrySchema.parse(dataWithNull);
            expect(result.completed_at).toBeNull();
        });
    });

    describe('DeleteEntrySchema', () => {
        it('should validate valid delete data', () => {
            const result = DeleteEntrySchema.parse({ id: 123 });
            expect(result).toEqual({ id: 123 });
        });

        it('should reject invalid ID', () => {
            expect(() => DeleteEntrySchema.parse({ id: 0 })).toThrow();
            expect(() => DeleteEntrySchema.parse({ id: -1 })).toThrow();
        });
    });

    describe('CreateHabitEntrySchema', () => {
        it('should validate valid habit entry data', () => {
            const validData = {
                habit_name: 'Exercise',
                dose: 30,
                date: '2024-01-01'
            };
            const result = CreateHabitEntrySchema.parse(validData);
            expect(result).toEqual(validData);
        });

        it('should reject invalid dose', () => {
            expect(() => CreateHabitEntrySchema.parse({
                habit_name: 'Exercise',
                dose: -1
            })).toThrow();
        });

        it('should reject habit name too long', () => {
            const longName = 'a'.repeat(101);
            expect(() => CreateHabitEntrySchema.parse({
                habit_name: longName,
                dose: 10
            })).toThrow();
        });
    });
});
