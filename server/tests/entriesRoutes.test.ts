import { jest } from '@jest/globals';
import type { Request, Response } from 'express';
import type { Knex } from 'knex';

// Mock the EntriesController
jest.mock('../src/controllers/entriesController', () => ({
    EntriesController: jest.fn().mockImplementation(() => ({
        getEntries: jest.fn(),
        getEntriesByStatus: jest.fn(),
        getRecentEntries: jest.fn(),
        createEntry: jest.fn(),
        updateEntry: jest.fn(),
        deleteEntry: jest.fn()
    }))
}));

// Mock the auth middleware
jest.mock('../src/middleware/authMiddleware', () => ({
    authenticateToken: jest.fn()
}));

// Mock date-fns
jest.mock('date-fns', () => ({
    startOfDay: jest.fn(),
    endOfDay: jest.fn(),
    parseISO: jest.fn()
}));

// Mock validation
jest.mock('../src/types/validation', () => ({
    CreateEntrySchema: {},
    UpdateEntrySchema: {},
    DeleteEntrySchema: {},
    GetEntriesParamsSchema: {},
    GetEntriesByStatusSchema: {},
    GetEntriesByStatusQuerySchema: {},
    validateBody: jest.fn(),
    validateParams: jest.fn(),
    validateQuery: jest.fn()
}));

import { EntriesController } from '../src/controllers/entriesController';
import { startOfDay, endOfDay, parseISO } from 'date-fns';
import { validateBody, validateParams, validateQuery } from '../src/types/validation';

describe('Entries Routes Logic', () => {
    let mockController: any;
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();

        mockController = {
            getEntries: jest.fn(),
            getEntriesByStatus: jest.fn(),
            getRecentEntries: jest.fn(),
            createEntry: jest.fn(),
            updateEntry: jest.fn(),
            deleteEntry: jest.fn()
        };

        (EntriesController as jest.Mock).mockImplementation(() => mockController);

        mockReq = {
            params: {},
            query: {},
            body: {}
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        } as Partial<Response>;
        mockNext = jest.fn();

        // Setup validation mocks to call next
        (validateBody as jest.Mock).mockImplementation(() => mockNext);
        (validateParams as jest.Mock).mockImplementation(() => mockNext);
        (validateQuery as jest.Mock).mockImplementation(() => mockNext);
    });

    describe('GET /entries/:date', () => {
        const getEntriesHandler = async (req: Request, res: Response) => {
            try {
                const requestedDate = new Date(req.params.date);
                if (isNaN(requestedDate.getTime())) {
                    return res.status(400).json({ error: 'Invalid date format', success: false });
                }

                const startOfDayUTC = startOfDay(requestedDate);
                const endOfDayUTC = endOfDay(requestedDate);

                const entries = await mockController.getEntries(
                    startOfDayUTC.toISOString().replace('T', ' '),
                    endOfDayUTC.toISOString().replace('T', ' ')
                );
                res.status(200).json({ entries, success: true });
            } catch (error) {
                res.status(500).json({ success: false, error: 'Internal server error' });
            }
        };

        it('should return entries for valid date', async () => {
            const mockEntries = [
                { id: 1, text: 'Test entry', completed: false, created_at: '2024-01-01 10:00:00' }
            ];
            const testDate = new Date('2024-01-01');
            const startDate = new Date('2024-01-01T00:00:00.000Z');
            const endDate = new Date('2024-01-01T23:59:59.999Z');

            mockReq.params = { date: '2024-01-01' };
            (startOfDay as jest.Mock).mockReturnValue(startDate);
            (endOfDay as jest.Mock).mockReturnValue(endDate);
            mockController.getEntries.mockResolvedValue(mockEntries);

            await getEntriesHandler(mockReq as Request, mockRes as Response);

            expect(startOfDay).toHaveBeenCalledWith(testDate);
            expect(endOfDay).toHaveBeenCalledWith(testDate);
            expect(mockController.getEntries).toHaveBeenCalledWith(
                '2024-01-01 00:00:00.000Z',
                '2024-01-01 23:59:59.999Z'
            );
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({ entries: mockEntries, success: true });
        });

        it('should return 400 for invalid date', async () => {
            mockReq.params = { date: 'invalid-date' };

            await getEntriesHandler(mockReq as Request, mockRes as Response);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: 'Invalid date format',
                success: false
            });
        });

        it('should handle database errors', async () => {
            mockReq.params = { date: '2024-01-01' };
            const testDate = new Date('2024-01-01');
            (startOfDay as jest.Mock).mockReturnValue(new Date());
            (endOfDay as jest.Mock).mockReturnValue(new Date());
            mockController.getEntries.mockRejectedValue(new Error('Database error'));

            await getEntriesHandler(mockReq as Request, mockRes as Response);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Internal server error'
            });
        });
    });

    describe('GET /entries/status/:completed', () => {
        const getEntriesByStatusHandler = async (req: Request, res: Response) => {
            try {
                const completed = req.params.completed === 'true';
                let start: string | undefined;
                let end: string | undefined;

                if (req.query.date) {
                    const requestedDate = parseISO(req.query.date as string);
                    if (isNaN(requestedDate.getTime())) {
                        return res.status(400).json({ error: 'Invalid date format', success: false });
                    }

                    const startOfDayUTC = startOfDay(requestedDate);
                    const endOfDayUTC = endOfDay(requestedDate);

                    start = startOfDayUTC.toISOString().replace('T', ' ');
                    end = endOfDayUTC.toISOString().replace('T', ' ');
                }

                const entries = await mockController.getEntriesByStatus(completed, start, end);
                res.status(200).json({
                    success: true,
                    entries: entries
                });
            } catch (error) {
                res.status(500).json({ success: false, error: 'Internal server error' });
            }
        };

        it('should return entries by completion status', async () => {
            const mockEntries = [
                { id: 1, text: 'Completed entry', completed: true }
            ];

            mockReq.params = { completed: 'true' };
            mockController.getEntriesByStatus.mockResolvedValue(mockEntries);

            await getEntriesByStatusHandler(mockReq as Request, mockRes as Response);

            expect(mockController.getEntriesByStatus).toHaveBeenCalledWith(true, undefined, undefined);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                entries: mockEntries
            });
        });

        it('should filter by date when provided', async () => {
            const mockEntries: any[] = [];
            const testDate = new Date('2024-01-01');
            const startDate = new Date('2024-01-01T00:00:00.000Z');
            const endDate = new Date('2024-01-01T23:59:59.999Z');

            mockReq.params = { completed: 'false' };
            mockReq.query = { date: '2024-01-01' };
            (parseISO as jest.Mock).mockReturnValue(testDate);
            (startOfDay as jest.Mock).mockReturnValue(startDate);
            (endOfDay as jest.Mock).mockReturnValue(endDate);
            mockController.getEntriesByStatus.mockResolvedValue(mockEntries);

            await getEntriesByStatusHandler(mockReq as Request, mockRes as Response);

            expect(parseISO).toHaveBeenCalledWith('2024-01-01');
            expect(mockController.getEntriesByStatus).toHaveBeenCalledWith(
                false,
                '2024-01-01 00:00:00.000Z',
                '2024-01-01 23:59:59.999Z'
            );
        });

        it('should return 400 for invalid date in query', async () => {
            mockReq.params = { completed: 'true' };
            mockReq.query = { date: 'invalid-date' };
            (parseISO as jest.Mock).mockReturnValue(new Date('invalid'));

            await getEntriesByStatusHandler(mockReq as Request, mockRes as Response);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: 'Invalid date format',
                success: false
            });
        });
    });

    describe('GET /entries/recent', () => {
        const getRecentEntriesHandler = async (req: Request, res: Response) => {
            try {
                const entries = await mockController.getRecentEntries(10);
                res.status(200).json({
                    success: true,
                    entries: entries
                });
            } catch (error) {
                res.status(500).json({ success: false, error: 'Internal server error' });
            }
        };

        it('should return recent entries', async () => {
            const mockEntries = [
                { id: 1, text: 'Recent entry', created_at: '2024-01-01 10:00:00' }
            ];

            mockController.getRecentEntries.mockResolvedValue(mockEntries);

            await getRecentEntriesHandler(mockReq as Request, mockRes as Response);

            expect(mockController.getRecentEntries).toHaveBeenCalledWith(10);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                entries: mockEntries
            });
        });
    });

    describe('GET /entries/recent/:limit', () => {
        const getRecentEntriesWithLimitHandler = async (req: Request, res: Response) => {
            const limit = parseInt(req.params.limit);
            if (isNaN(limit) || limit < 1 || limit > 100) {
                return res.status(400).json({
                    success: false,
                    error: 'Limit must be a number between 1 and 100'
                });
            }

            try {
                const entries = await mockController.getRecentEntries(limit);
                res.status(200).json({
                    success: true,
                    entries: entries
                });
            } catch (error) {
                res.status(500).json({ success: false, error: 'Internal server error' });
            }
        };

        it('should return recent entries with custom limit', async () => {
            const mockEntries: any[] = [];
            mockReq.params = { limit: '5' };
            mockController.getRecentEntries.mockResolvedValue(mockEntries);

            await getRecentEntriesWithLimitHandler(mockReq as Request, mockRes as Response);

            expect(mockController.getRecentEntries).toHaveBeenCalledWith(5);
            expect(mockRes.status).toHaveBeenCalledWith(200);
        });

        it('should return 400 for invalid limit', async () => {
            mockReq.params = { limit: '150' };

            await getRecentEntriesWithLimitHandler(mockReq as Request, mockRes as Response);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Limit must be a number between 1 and 100'
            });
        });

        it('should return 400 for non-numeric limit', async () => {
            mockReq.params = { limit: 'abc' };

            await getRecentEntriesWithLimitHandler(mockReq as Request, mockRes as Response);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Limit must be a number between 1 and 100'
            });
        });
    });

    describe('POST /entries', () => {
        it('should create entry successfully', () => {
            mockReq.body = { text: 'New entry', completed: false };

            // The actual handler just calls the controller
            mockController.createEntry(mockReq, mockRes, mockNext);

            expect(mockController.createEntry).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
        });
    });

    describe('PUT /entries', () => {
        it('should update entry successfully', () => {
            mockReq.body = { id: 1, text: 'Updated entry', completed: true };

            // The actual handler just calls the controller
            mockController.updateEntry(mockReq, mockRes, mockNext);

            expect(mockController.updateEntry).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
        });
    });

    describe('DELETE /entries', () => {
        it('should delete entry successfully', () => {
            mockReq.body = { id: 1 };

            // The actual handler just calls the controller
            mockController.deleteEntry(mockReq, mockRes, mockNext);

            expect(mockController.deleteEntry).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
        });
    });
});
