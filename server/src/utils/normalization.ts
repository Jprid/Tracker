import { z } from 'zod';

// Normalization utilities
export function normalizeMedicineName(name: string): string {
    if (!name || typeof name !== 'string') return '';

    return name
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
        .trim();
}

export function areNamesEquivalent(name1: string, name2: string): boolean {
    return normalizeMedicineName(name1) === normalizeMedicineName(name2);
}

// Common medicine name mappings for special cases
export const MEDICINE_NAME_MAPPINGS: Record<string, string> = {
    // Add any special mappings here if needed
    // 'nicotin': 'Nicotine', // if there are common typos
};

// Enhanced validation schema with normalization
export const CreateHabitEntrySchema = z.object({
    habit_name: z.string()
        .min(1, 'Medicine name is required')
        .max(100, 'Medicine name too long')
        .transform((name) => {
            // Apply special mappings first
            const mappedName = MEDICINE_NAME_MAPPINGS[name.toLowerCase()] || name;
            // Then normalize
            return normalizeMedicineName(mappedName);
        }),
    dose: z.number().positive('Dose must be positive').max(10000, 'Dose too high'),
    date: z.string().optional()
});

export const UpdateHabitEntrySchema = z.object({
    id: z.number().int().positive('ID must be a positive integer'),
    name: z.string()
        .min(1, 'Medicine name is required')
        .max(100, 'Medicine name too long')
        .transform((name) => {
            const mappedName = MEDICINE_NAME_MAPPINGS[name.toLowerCase()] || name;
            return normalizeMedicineName(mappedName);
        }),
    dose: z.number().positive('Dose must be positive').max(10000, 'Dose too high'),
    created_at: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date format')
});
