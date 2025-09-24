import { jest } from '@jest/globals';
import type { Request, Response } from 'express';
import type { Knex } from 'knex';
import { EntriesController, type Entry } from '../src/controllers/entriesController.ts';

// Mock Knex
const mockKnexQuery = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    returning: jest.fn(),
    update: jest.fn(),
    del: jest.fn(),
    first: jest.fn(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    select: jest.fn(),
    then: jest.fn().mockImplementation(function(this: any, resolve: any) {
        // Resolve to the result of select() if it was called, otherwise use default data
        if (this.select.mock.results.length > 0) {
            resolve(this.select.mock.results[this.select.mock.results.length - 1].value);
        } else {
            // For queries without explicit select(), return default data that can be set in tests
            resolve(this._mockData || []);
        }
    }),
    _mockData: [] as any[] // Default data for queries without select()
} as any;

const mockKnex = jest.fn().mockReturnValue(mockKnexQuery) as any;

describe('EntriesController', () => {
    let controller: EntriesController;
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: jest.Mock;

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        // Set up default mock return values
        mockKnexQuery.returning.mockResolvedValue([123]);
        mockKnexQuery.update.mockResolvedValue(1);
        mockKnexQuery.del.mockResolvedValue(1);
        mockKnexQuery.first.mockResolvedValue({ id: 123 });
        mockKnexQuery.select.mockResolvedValue([]);
        mockKnexQuery._mockData = [];

        // Create controller with mocked db
        controller = new EntriesController(mockKnex as any);

        // Mock request/response
        mockReq = {
            body: {}
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        } as Partial<Response>;
        mockNext = jest.fn();
    });

    describe('getEntries', () => {
        it('should return entries within date range', async () => {
            const mockEntries: Entry[] = [
                {
                    id: 1,
                    text: 'Test entry',
                    completed: false,
                    completed_at: null,
                    created_at: '2024-01-01 10:00:00'
                }
            ];

            mockKnexQuery._mockData = mockEntries;

            const result = await controller.getEntries('2024-01-01', '2024-01-02');

            expect(mockKnex).toHaveBeenCalledWith('entries');
            expect(mockKnexQuery.where).toHaveBeenCalledWith('created_at', '>=', '2024-01-01');
            expect(mockKnexQuery.andWhere).toHaveBeenCalledWith('created_at', '<', '2024-01-02');
            expect(result).toEqual(mockEntries);
        });
    });

    describe('createEntry', () => {
        it('should create entry successfully', async () => {
            mockReq.body = { text: 'New entry', completed: false };
            mockKnexQuery.returning.mockResolvedValue([123]);

            await controller.createEntry(mockReq as Request, mockRes as Response, mockNext);

            expect(mockKnex).toHaveBeenCalledWith('entries');
            expect(mockKnexQuery.insert).toHaveBeenCalledWith({ text: 'New entry', completed: false });
            expect(mockKnexQuery.returning).toHaveBeenCalledWith('id');
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: 'Entry created successfully',
                id: 123
            });
        });

        it('should handle database error during creation', async () => {
            mockReq.body = { text: 'New entry' };
            const mockError = new Error('Database error');
            mockKnexQuery.returning.mockRejectedValue(mockError);

            await controller.createEntry(mockReq as Request, mockRes as Response, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Failed to create entry'
            });
        });
    });

    describe('updateEntry', () => {
        it('should update entry successfully', async () => {
            mockReq.body = {
                id: 123,
                text: 'Updated entry',
                completed: true,
                completed_at: '2024-01-01T10:00:00Z'
            };
            mockKnexQuery.first.mockResolvedValue({ id: 123 });

            await controller.updateEntry(mockReq as Request, mockRes as Response, mockNext);

            expect(mockKnex).toHaveBeenCalledWith('entries');
            expect(mockKnexQuery.where).toHaveBeenCalledWith({ id: 123 });
            expect(mockKnexQuery.first).toHaveBeenCalled();
            expect(mockKnexQuery.update).toHaveBeenCalledWith({
                text: 'Updated entry',
                completed: true,
                completed_at: '2024-01-01 10:00:00Z'
            });
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: 'Entry updated successfully'
            });
        });

        it('should return 404 when entry not found', async () => {
            mockReq.body = { id: 999, text: 'Updated entry' };
            mockKnexQuery.first.mockResolvedValue(null);

            await controller.updateEntry(mockReq as Request, mockRes as Response, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: 'Entry not found.',
                success: false
            });
        });

        it('should handle database error during update', async () => {
            mockReq.body = { id: 123, text: 'Updated entry' };
            mockKnexQuery.first.mockResolvedValue({ id: 123 });
            const mockError = new Error('Database error');
            mockKnexQuery.update.mockRejectedValue(mockError);

            await controller.updateEntry(mockReq as Request, mockRes as Response, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Failed to update entry'
            });
        });
    });

    describe('deleteEntry', () => {
        it('should delete entry successfully', async () => {
            mockReq.body = { id: 123 };
            mockKnexQuery.del.mockResolvedValue(1);

            await controller.deleteEntry(mockReq as Request, mockRes as Response, mockNext);

            expect(mockKnex).toHaveBeenCalledWith('entries');
            expect(mockKnexQuery.where).toHaveBeenCalledWith({ id: 123 });
            expect(mockKnexQuery.del).toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: 'Entry deleted successfully'
            });
        });

        it('should return 404 when entry not found for deletion', async () => {
            mockReq.body = { id: 999 };
            mockKnexQuery.del.mockResolvedValue(0);

            await controller.deleteEntry(mockReq as Request, mockRes as Response, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: 'Entry not found.',
                success: false
            });
        });

        it('should handle database error during deletion', async () => {
            mockReq.body = { id: 123 };
            const mockError = new Error('Database error');
            mockKnexQuery.del.mockRejectedValue(mockError);

            await controller.deleteEntry(mockReq as Request, mockRes as Response, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Failed to delete entry'
            });
        });
    });

    describe('getEntriesByStatus', () => {
        it('should return entries by completion status', async () => {
            const mockEntries: Entry[] = [
                {
                    id: 1,
                    text: 'Completed entry',
                    completed: true,
                    completed_at: '2024-01-01 10:00:00',
                    created_at: '2024-01-01 09:00:00'
                }
            ];

            mockKnexQuery._mockData = mockEntries;

            const result = await controller.getEntriesByStatus(true);

            expect(mockKnex).toHaveBeenCalledWith('entries');
            expect(mockKnexQuery.where).toHaveBeenCalledWith({ completed: true });
            expect(mockKnexQuery.orderBy).toHaveBeenCalledWith('created_at', 'desc');
            expect(result).toEqual(mockEntries);
        });

        it('should filter by date range when provided', async () => {
            const mockEntries: Entry[] = [];
            mockKnexQuery.select.mockResolvedValue(mockEntries);

            await controller.getEntriesByStatus(false, '2024-01-01', '2024-01-02');

            expect(mockKnexQuery.where).toHaveBeenNthCalledWith(1, { completed: false });
            expect(mockKnexQuery.where).toHaveBeenNthCalledWith(2, 'created_at', '>=', '2024-01-01');
            expect(mockKnexQuery.andWhere).toHaveBeenCalledWith('created_at', '<', '2024-01-02');
        });
    });

    describe('getRecentEntries', () => {
        it('should return recent entries with default limit', async () => {
            const mockEntries: Entry[] = [
                {
                    id: 1,
                    text: 'Recent entry',
                    completed: false,
                    completed_at: null,
                    created_at: '2024-01-01 10:00:00'
                }
            ];

            mockKnexQuery._mockData = mockEntries;

            const result = await controller.getRecentEntries();

            expect(mockKnex).toHaveBeenCalledWith('entries');
            expect(mockKnexQuery.orderBy).toHaveBeenCalledWith('created_at', 'desc');
            expect(mockKnexQuery.limit).toHaveBeenCalledWith(10);
            expect(result).toEqual(mockEntries);
        });

        it('should return recent entries with custom limit', async () => {
            const mockEntries: Entry[] = [];
            mockKnexQuery.select.mockResolvedValue(mockEntries);

            await controller.getRecentEntries(5);

            expect(mockKnexQuery.limit).toHaveBeenCalledWith(5);
        });
    });
});
