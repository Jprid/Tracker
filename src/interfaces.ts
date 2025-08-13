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
}

export interface SubstanceStatsMap {
    [substance: string]: SubstanceStats;
}

// Props interfaces
export interface SubstanceTableProps {
    onDataChange: (data: SubstanceEntry[]) => void;
}

export interface SubstanceTableState {
    data: SubstanceEntry[];
}

// @ts-ignore
export interface StatsComponentProps {}

export interface StatsComponentState {
    substanceStats: SubstanceStatsMap;
}
