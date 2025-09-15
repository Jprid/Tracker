export interface SubstanceEntry {
    id: number;
    time: string;
    name: string;
    dose: number;
    notes: string;
}

export interface SubstanceStats {
    totalDose: number;
    count: number;
    frequency: number;
}

// Props interfaces
export interface SubstanceTableProps {
    onDataChange: (data: SubstanceEntry[]) => void,
    entries: SubstanceEntry[],
    selectedTab?: "entry" | "medicine",
    onTabChange?: (tab: 'entry' | 'medicine') => void
}


export interface StatsComponentProps {
    entries: SubstanceEntry[];
    dayTotals: DayTotals[];
}

export type DayTotals = { day: number; total: number }[];

export interface StatsComponentState {
    stats: { [key: string]: SubstanceStats };
    dayTotals: DayTotals[];
}

export interface EntryTerminalProps {
    onAdd: (entry: Omit<SubstanceEntry, 'id'>) => void;
    onSave: (medium: string) => void;
    onClear: () => void;
    entries: SubstanceEntry[];
}

export interface DataPoint {
    day: number;
    total: number;
}

export interface PivotTableProps {
    data: DataPoint[];
}

export class SubstanceTableState {
    entries: SubstanceEntry[] = [];
    selectedTab!: "entry" | "medicine";
}