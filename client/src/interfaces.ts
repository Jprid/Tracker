import type {StatsComponent} from "./stats/Stats.tsx";

export interface SubstanceEntry {
    id: number;
    time: string;
    entry_type: string;
    dose: number;
    notes: string;
}

export interface Entry {
    created_at: Date;
    habit_name: string;
    dose: number;
}

export interface SubstanceStats {
    totalDose: number;
    count: number;
    frequency: number;
}

// Props interfaces
export interface SubstanceTableProps {
    onDataChange: (data: SubstanceEntry[]) => void;
    entries: SubstanceEntry[];
}

export interface SubstanceTableState {
    data: SubstanceEntry[];
}

export interface StatsComponentProps {
    entries: SubstanceEntry[];
    dayTotals: DayTotals[];
}

export type DayTotals = { day: number; total: number }[];

export interface StatsComponentState {
    stats: { [key: string]: SubstanceStats};
    dayTotals: DayTotals[];
}
export interface EntryTerminalProps {
    onAdd: (entry: Omit<SubstanceEntry, 'id'>) => void;
    onSave: (medium: string) => void;
    onClear: () => void;
    entries: SubstanceEntry[];
}
