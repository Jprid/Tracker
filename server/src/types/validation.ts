import { z } from 'zod';

// Medicine/Habit Entry Schemas
export const CreateHabitEntrySchema = z.object({
    habit_name: z.string().min(1, 'Habit name is required').max(100, 'Habit name too long'),
    dose: z.number().positive('Dose must be positive').max(10000, 'Dose too high'),
    date: z.string().optional() // Will be validated as ISO date if provided
});

export const CreateHabitEntryParamsSchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)')
});

export const UpdateHabitEntrySchema = z.object({
    id: z.number().int().positive('ID must be a positive integer'),
    name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
    dose: z.number().positive('Dose must be positive').max(10000, 'Dose too high'),
    created_at: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date format')
});

export const DeleteHabitEntrySchema = z.object({
    id: z.number().int().positive('ID must be a positive integer')
});

export const GetHabitEntriesParamsSchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)')
});

export const GetHabitTotalsParamsSchema = z.object({
    name: z.string().min(1, 'Habit name is required').max(100, 'Habit name too long')
});

// Auth Schemas
export const RefreshTokenCookiesSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token is required')
});

// Entries Schemas
export const CreateEntrySchema = z.object({
    text: z.string().min(1, 'Entry text is required').max(1000, 'Entry text too long'),
    completed: z.boolean().optional().default(false)
});

export const UpdateEntrySchema = z.object({
    id: z.number().int().positive('ID must be a positive integer'),
    text: z.string().min(1, 'Entry text is required').max(1000, 'Entry text too long'),
    completed: z.boolean(),
    completed_at: z.string().nullable().optional().refine((val) => !val || !isNaN(Date.parse(val)), 'Invalid date format')
});

export const DeleteEntrySchema = z.object({
    id: z.number().int().positive('ID must be a positive integer')
});

export const GetEntriesParamsSchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)')
});

export const GetEntriesByStatusSchema = z.object({
    completed: z.string().transform(val => val === 'true').pipe(z.boolean())
});

export const GetEntriesByStatusQuerySchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional()
});

// Validation middleware functions for different request parts
export function validateBody(schema: z.ZodSchema) {
    return (req: any, res: any, next: any) => {
        try {
            req.body = schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: error.errors.map(err => ({
                        field: err.path.join('.'),
                        message: err.message
                    }))
                });
            } else {
                res.status(500).json({
                    success: false,
                    error: 'Internal server error'
                });
            }
        }
    };
}

export function validateParams(schema: z.ZodSchema) {
    return (req: any, res: any, next: any) => {
        try {
            req.params = schema.parse(req.params);
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: error.errors.map(err => ({
                        field: err.path.join('.'),
                        message: err.message
                    }))
                });
            } else {
                res.status(500).json({
                    success: false,
                    error: 'Internal server error'
                });
            }
        }
    };
}

export function validateCookies(schema: z.ZodSchema) {
    return (req: any, res: any, next: any) => {
        try {
            req.cookies = schema.parse(req.cookies);
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: error.errors.map(err => ({
                        field: err.path.join('.'),
                        message: err.message
                    }))
                });
            } else {
                res.status(500).json({
                    success: false,
                    error: 'Internal server error'
                });
            }
        }
    };
}

export function validateQuery(schema: z.ZodSchema) {
    return (req: any, res: any, next: any) => {
        try {
            req.query = schema.parse(req.query);
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: error.errors.map(err => ({
                        field: err.path.join('.'),
                        message: err.message
                    }))
                });
            } else {
                res.status(500).json({
                    success: false,
                    error: 'Internal server error'
                });
            }
        }
    };
}
