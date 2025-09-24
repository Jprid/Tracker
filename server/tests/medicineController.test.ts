import { MedicineController } from '../src/controllers/medicineController';
import { jest } from '@jest/globals';

// Mock Knex
const mockKnexQuery = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    into: jest.fn(),
    first: jest.fn(),
    update: jest.fn(),
    del: jest.fn(),
    distinct: jest.fn().mockReturnThis(),
    pluck: jest.fn(),
    raw: jest.fn(),
} as any;

const mockKnex = jest.fn().mockReturnValue(mockKnexQuery) as any;

// Add insert and raw methods directly to the Knex instance
Object.assign(mockKnex, {
    insert: jest.fn().mockReturnValue({
        into: jest.fn().mockImplementation(() => Promise.resolve([1]))
    }),
    raw: jest.fn().mockImplementation(() => Promise.resolve([]))
});

jest.mock('knex', () => {
    return jest.fn(() => mockKnex);
});

describe('MedicineController', () => {
    let controller: MedicineController;
    let mockReq: any;
    let mockRes: any;
    let mockNext: any;

    beforeEach(() => {
        jest.clearAllMocks();

        // Set up default mock return values
        mockKnexQuery.into.mockResolvedValue([1]);
        mockKnexQuery.first.mockResolvedValue({ id: 1 });
        mockKnexQuery.update.mockResolvedValue(1);
        mockKnexQuery.del.mockResolvedValue(1);
        mockKnexQuery.pluck.mockResolvedValue([]);
        mockKnexQuery.raw.mockResolvedValue([]);
        mockKnexQuery.andWhere.mockResolvedValue([]);

        // Mock the knex function to handle different calling patterns
        mockKnex.mockImplementation((table?: string) => {
            if (table) {
                // When called with table name, return query builder
                return mockKnexQuery;
            }
            // When called without arguments, return the knex instance with raw method
            return {
                ...mockKnexQuery,
                raw: mockKnexQuery.raw
            };
        });

        controller = new MedicineController(mockKnex as any);

        mockReq = {
            body: {}
        };

        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        mockNext = jest.fn();
    });

    describe('getHabitEntries', () => {
        it('should return habit entries for date range', async () => {
            const mockEntries = [
                { id: 1, day_id: 1, habit_name: 'aspirin', dose: 100, completed: true }
            ];

            mockKnexQuery.andWhere.mockResolvedValue(mockEntries);

            const result = await controller.getHabitEntries('2024-01-01', '2024-01-02');

            expect(result).toEqual(mockEntries);
        });
    });

    describe('createHabitEntry', () => {
        it('should create a new habit entry', async () => {
            mockReq.body = { habit_name: 'ASPIRIN', dose: 100 };

            await controller.createHabitEntry(mockReq, mockRes, mockNext);

            expect(mockNext).not.toHaveBeenCalled();
        });
    });

    describe('update', () => {
        it('should update an existing habit entry', async () => {
            mockReq.body = {
                id: 1,
                name: 'aspirin',
                dose: 200,
                created_at: '2024-01-01T10:00:00Z'
            };

            await controller.update(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Habit entry updated.' });
        });
    });

    describe('deleteHabitEntry', () => {
        it('should delete a habit entry', async () => {
            mockReq.body = { id: 1 };

            await controller.deleteHabitEntry(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Habit entry deleted.' });
        });
    });

    describe('getHabitTotals', () => {
        it('should return habit totals', async () => {
            const mockTotals = [{ created_at: '2024-01-01', total: 200 }];
            mockKnex.raw.mockResolvedValueOnce(mockTotals);

            const result = await controller.getHabitTotals('aspirin', 10);

            expect(result).toEqual(mockTotals);
        });
    });

    describe('getHourHistogram', () => {
        it('should return hour histogram data', async () => {
            const mockHistogram = [{ created_at: '2024-01-01 10:00:00', total: 5 }];
            mockKnex.raw.mockResolvedValueOnce(mockHistogram);

            const result = await controller.getHourHistogram('aspirin', 10);

            expect(result).toEqual(mockHistogram);
        });
    });

    describe('getUniqueSubstances', () => {
        it('should return unique substance names', async () => {
            const mockSubstances = ['aspirin', 'ibuprofen'];
            mockKnexQuery.pluck.mockResolvedValue(mockSubstances);

            const result = await controller.getUniqueSubstances();

            expect(result).toEqual(mockSubstances);
        });
    });
});
