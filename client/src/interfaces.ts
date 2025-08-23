export interface SubstanceEntry {
    id: number;
    time: string;
    substance: string;
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
    onDataChange: (data: SubstanceEntry[]) => void;
    entries: SubstanceEntry[];
}

export interface SubstanceTableState {
    data: SubstanceEntry[];
}

export interface StatsComponentProps {
    entries: SubstanceEntry[];
}

export interface StatsComponentState {
    substanceStats: { [key: string]: SubstanceStats};
}
export interface EntryTerminalProps {
    onAdd: (entry: Omit<SubstanceEntry, 'id'>) => void;
    onSave: (medium: string) => void;
    onClear: () => void;
    entries: SubstanceEntry[];
}
