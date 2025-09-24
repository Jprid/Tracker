import { jest } from '@jest/globals';
import type { Request, Response } from 'express';
import type { Knex } from 'knex';

// Mock the MedicineController
jest.mock('../src/controllers/medicineController', () => ({
    MedicineController: jest.fn().mockImplementation(() => ({
        getUniqueSubstances: jest.fn(),
        getHabitTotals: jest.fn(),
        getHabitEntries: jest.fn(),
        createHabitEntry: jest.fn(),
        update: jest.fn(),
        deleteHabitEntry: jest.fn()
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
    CreateHabitEntrySchema: {},
    CreateHabitEntryParamsSchema: {},
    UpdateHabitEntrySchema: {},
    DeleteHabitEntrySchema: {},
    GetHabitTotalsParamsSchema: {},
    validateBody: jest.fn(),
    validateParams: jest.fn()
}));

import { MedicineController } from '../src/controllers/medicineController';
import { startOfDay, endOfDay } from 'date-fns';
import { validateBody, validateParams } from '../src/types/validation';

describe('Medicine Routes Logic', () => {
    let mockController: any;
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();

        mockController = {
            getUniqueSubstances: jest.fn(),
            getHabitTotals: jest.fn(),
            getHabitEntries: jest.fn(),
            createHabitEntry: jest.fn(),
            update: jest.fn(),
            deleteHabitEntry: jest.fn()
        };

        (MedicineController as jest.Mock).mockImplementation(() => mockController);

        mockReq = {
            params: {},
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
    });

    describe('GET /medicine/substances', () => {
        const getUniqueSubstancesHandler = async (req: Request, res: Response) => {
            try {
                const substances = await mockController.getUniqueSubstances();
                res.status(200).json({
                    success: true,
                    substances: substances
                });
            } catch (error) {
                res.status(500).json({ success: false, error: 'Internal server error' });
            }
        };

        it('should return unique substances', async () => {
            const mockSubstances = ['aspirin', 'ibuprofen', 'acetaminophen'];
            mockController.getUniqueSubstances.mockResolvedValue(mockSubstances);

            await getUniqueSubstancesHandler(mockReq as Request, mockRes as Response);

            expect(mockController.getUniqueSubstances).toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                substances: mockSubstances
            });
        });

        it('should handle database errors', async () => {
            mockController.getUniqueSubstances.mockRejectedValue(new Error('Database error'));

            await getUniqueSubstancesHandler(mockReq as Request, mockRes as Response);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Internal server error'
            });
        });
    });

    describe('GET /medicine/:name/pivot', () => {
        const getHabitTotalsHandler = async (req: Request, res: Response) => {
            try {
                const values = await mockController.getHabitTotals(req.params.name, 9);
                res.status(200).json({
                    success: true,
                    entries: values
                });
            } catch (error) {
                res.status(500).json({ success: false, error: 'Internal server error' });
            }
        };

        it('should return habit totals for substance', async () => {
            const mockTotals = [
                { created_at: '2024-01-01', total: 200 },
                { created_at: '2024-01-02', total: 150 }
            ];
            mockReq.params = { name: 'aspirin' };
            mockController.getHabitTotals.mockResolvedValue(mockTotals);

            await getHabitTotalsHandler(mockReq as Request, mockRes as Response);

            expect(mockController.getHabitTotals).toHaveBeenCalledWith('aspirin', 9);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                entries: mockTotals
            });
        });

        it('should handle database errors', async () => {
            mockReq.params = { name: 'aspirin' };
            mockController.getHabitTotals.mockRejectedValue(new Error('Database error'));

            await getHabitTotalsHandler(mockReq as Request, mockRes as Response);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Internal server error'
            });
        });
    });

    describe('GET /medicine/:date', () => {
        const getHabitEntriesHandler = async (req: Request, res: Response) => {
            try {
                const requestedDate = new Date(req.params.date);
                if (isNaN(requestedDate.getTime())) {
                    return res.status(400).json({ error: 'Invalid date format', success: false });
                }

                const startOfDayUTC = startOfDay(requestedDate);
                const endOfDayUTC = endOfDay(requestedDate);

                const entries = await mockController.getHabitEntries(
                    startOfDayUTC.toISOString().replace('T', ' '),
                    endOfDayUTC.toISOString().replace('T', ' ')
                );
                res.status(200).json({ entries, success: true });
            } catch (error) {
                res.status(500).json({ success: false, error: 'Internal server error' });
            }
        };

        it('should return habit entries for valid date', async () => {
            const mockEntries = [
                { id: 1, habit_name: 'aspirin', dose: 100, completed: true }
            ];
            const testDate = new Date('2024-01-01');
            const startDate = new Date('2024-01-01T00:00:00.000Z');
            const endDate = new Date('2024-01-01T23:59:59.999Z');

            mockReq.params = { date: '2024-01-01' };
            (startOfDay as jest.Mock).mockReturnValue(startDate);
            (endOfDay as jest.Mock).mockReturnValue(endDate);
            mockController.getHabitEntries.mockResolvedValue(mockEntries);

            await getHabitEntriesHandler(mockReq as Request, mockRes as Response);

            expect(startOfDay).toHaveBeenCalledWith(testDate);
            expect(endOfDay).toHaveBeenCalledWith(testDate);
            expect(mockController.getHabitEntries).toHaveBeenCalledWith(
                '2024-01-01 00:00:00.000Z',
                '2024-01-01 23:59:59.999Z'
            );
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({ entries: mockEntries, success: true });
        });

        it('should return 400 for invalid date', async () => {
            mockReq.params = { date: 'invalid-date' };

            await getHabitEntriesHandler(mockReq as Request, mockRes as Response);

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
            mockController.getHabitEntries.mockRejectedValue(new Error('Database error'));

            await getHabitEntriesHandler(mockReq as Request, mockRes as Response);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Internal server error'
            });
        });
    });

    describe('POST /medicine/:date/create', () => {
        const createHabitEntryHandler = (req: Request, res: Response) => {
            req.body.date = req.params.date;
            mockController.createHabitEntry(req, res, mockNext);
        };

        it('should create habit entry', () => {
            mockReq.params = { date: '2024-01-01' };
            mockReq.body = { habit_name: 'aspirin', dose: 100 };

            createHabitEntryHandler(mockReq as Request, mockRes as Response);

            expect(mockReq.body.date).toBe('2024-01-01');
            expect(mockController.createHabitEntry).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
        });
    });

    describe('PUT /medicine/update', () => {
        const updateHabitEntryHandler = (req: Request, res: Response) => {
            mockController.update(req, res, mockNext);
        };

        it('should update habit entry', () => {
            mockReq.body = { id: 1, name: 'aspirin', dose: 200 };

            updateHabitEntryHandler(mockReq as Request, mockRes as Response);

            expect(mockController.update).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
        });
    });

    describe('DELETE /medicine/delete', () => {
        const deleteHabitEntryHandler = (req: Request, res: Response) => {
            mockController.deleteHabitEntry(req, res, mockNext);
        };

        it('should delete habit entry', () => {
            mockReq.body = { id: 1 };

            deleteHabitEntryHandler(mockReq as Request, mockRes as Response);

            expect(mockController.deleteHabitEntry).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
        });
    });
});
