export type TabType = 'entry' | 'medicine' | 'all';

export interface MedicineEntry {
    id: number;
    created_at: string;
    displayTime: string;
    name: string;
    dose: number;
}

export interface Entry {
    id: number;
    text: string;
    completed: boolean;
    completed_at?: string;
    created_at: string;
    displayTime: string;
}

export interface SubstanceStats {
    totalDose: number;
    count: number;
    frequency: number;
}

// API Response interfaces
export interface ApiMedicineEntry {
    id: number;
    time: string;
    name: string;
    dose: number;
    created_at: string;
}

export interface ApiDayTotal {
    created_at: string;
    total: number;
}

export interface ApiResponse<T> {
    entries: T[];
}

// Props interfaces
export interface SubstanceTableProps {
    onDataChange: (data: MedicineEntry[] | Entry[]) => void;
    entries: MedicineEntry[] | Entry[];
    medicineEntries?: MedicineEntry[];
    habitEntries?: Entry[];
    selectedTab?: TabType;
    onTabChange?: (tab: TabType) => void;
    onUpdate?: (entry: MedicineEntry | Entry) => void;
    onDelete?: (entry: MedicineEntry | Entry) => void;
    isLoading?: boolean;
}


export interface StatsComponentProps {
    entries: MedicineEntry[] | Entry[] | (MedicineEntry | Entry)[];
    dayTotals: DataPoint[];
    selectedTab: TabType;
    isLoading?: boolean;
    isToday: boolean;
}

export type DayTotals = { day: number; total: number }[];

export interface StatsComponentState {
    stats: { [key: string]: SubstanceStats };
    dayTotals: DayTotals[];
}

export interface EntryTerminalProps {
    onAddMedicine: (entry: { name: string; dose: number }) => void;
    onAddEntry?: (entry: { text: string; completed: boolean }) => void;
    onUpdate: (entry: MedicineEntry) => void;
    onDelete?: (entry: MedicineEntry) => void;
    entries: MedicineEntry[];
}

export interface DataPoint {
    day: string | number;
    total: number;
}

export interface PivotTableProps {
    data: DataPoint[];
    label?: string;
    backgroundColor?: string;
    borderColor?: string;
    xAxisFontSize?: number;
    yAxisFontSize?: number;
    xAxisFontFamily?: string;
    yAxisFontFamily?: string;
    gridColor?: string;
    xAxisFontColor?: string;
    yAxisFontColor?: string;
}

export class SubstanceTableState {
    entries: MedicineEntry[] = [];
    selectedTab!: TabType;
}

export type AuthParams = {
    accessToken?: string;
    setAccessToken?: (token: string | undefined) => void;
};