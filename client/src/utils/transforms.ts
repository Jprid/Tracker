import type { DataPoint, MedicineEntry, Entry, ApiMedicineEntry } from "../types/interfaces";



export const transformEntriesToDataPoints =
    (entries: { created_at: string; total: number }[]): DataPoint[] =>
        entries.map((entry: { created_at: string; total: number }): DataPoint => ({
                day: entry.created_at.split('-').slice(1,3).join('-'), // MMDD format
                total: entry.total
            }));

export const mapMedicineEntries = (entries: ApiMedicineEntry[]): MedicineEntry[] => {
    return entries.map((entry: ApiMedicineEntry) => ({
        id: entry.id,
        created_at: entry.created_at, // Keep original ISO string for sorting
        displayTime: new Date(entry.created_at + 'Z').toLocaleString('en-US', {
            hour: '2-digit', minute: '2-digit', hour12: true,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }),
        name: entry.name,
        dose: entry.dose,
    }));
};

export const mapEntries = (entries: Entry[]): Entry[] => {
    return entries.map((entry: Entry) => ({
        id: entry.id,
        created_at: entry.created_at, // Keep original ISO string for sorting
        displayTime: new Date(entry.created_at + 'Z').toLocaleString('en-US', {
            hour: '2-digit', minute: '2-digit', hour12: true,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }),
        text: entry.text,
        completed: entry.completed,
        completed_at: entry.completed_at,
    }));
};