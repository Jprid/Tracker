import './App.css'
import {memo, type JSX, useCallback, useRef, useEffect, useState} from 'react';
import {StatsComponent} from "./components/stats/Stats";
import Table from "./components/stats/Table.tsx";
import {EntryTerminal} from "./components/entry-terminal/EntryTerminal";
import {BrowserRouter, useSearchParams} from 'react-router-dom';
import ErrorBoundary from "./components/ui/ErrorBoundary.tsx";
import {ToastProvider} from "./contexts/ToastContext.tsx";
import {ToastContainer} from "./components/ui/ToastContainer.tsx";
import type { MedicineEntry, Entry, TabType } from './types/interfaces.ts';
import { useMedicineStore, useEntryStore, useUiStore } from './stores';
import { useAuth } from './contexts/AuthContext';
import { useToast } from './hooks/useToast';
import DateDisplay from './components/date-display/DateDisplay.tsx';

function AppContent(): JSX.Element {
    const { accessToken, setAccessToken } = useAuth();
    const toast = useToast();
    const [searchParams, setSearchParams] = useSearchParams();

    // Use Zustand stores
    const medicineStore = useMedicineStore();
    const entryStore = useEntryStore();
    const uiStore = useUiStore();

    // Viewing date state - defaults to today, can be controlled by query param
    const [viewingDate, setViewingDate] = useState<Date>(() => {
        const dateParam = searchParams.get('date');
        if (dateParam) {
            const parsedDate = new Date(dateParam);
            return isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
        }
        return new Date();
    });

    // Loading state for data fetching
    const [isLoadingData, setIsLoadingData] = useState(false);

    // Calculate if viewing date is today
    const isToday = viewingDate.toDateString() === new Date().toDateString();

    // Function to update viewing date and URL
    const updateViewingDate = useCallback((newDate: Date) => {
        setViewingDate(newDate);
        const dateString = newDate.toISOString().split('T')[0];
        setSearchParams({ date: dateString });
    }, [setSearchParams]);

    // Function to reset viewing date to today
    const resetToToday = useCallback(() => {
        const today = new Date();
        updateViewingDate(today);
    }, [updateViewingDate]);

    // Ref to access EntryTerminal's focus and expansion methods
    const entryTerminalRef = useRef<{ focusInput: () => void; expandTerminal: () => void; collapseTerminal: () => void } | null>(null);

    // Global keybinding for focusing entry terminal
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Focus and expand entry terminal when '/' is pressed (unless user is typing in an input)
            if (event.key === '/' && event.target instanceof HTMLElement) {
                // Don't trigger if user is already typing in an input field
                if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.contentEditable === 'true') {
                    return;
                }

                console.log('Slash key pressed, expanding and focusing terminal');
                event.preventDefault();
                entryTerminalRef.current?.expandTerminal();
                entryTerminalRef.current?.focusInput();
            }
            
            // Collapse terminal when Escape is pressed
            if (event.key === 'Escape') {
                console.log('Escape key pressed, collapsing terminal');
                entryTerminalRef.current?.collapseTerminal();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Initial data fetching - only run once when component mounts and accessToken is available
    const initialFetchDone = useRef(false);
    
    useEffect(() => {
        const fetchInitialData = async () => {
            console.log('📱 App: fetchInitialData called - accessToken:', !!accessToken, 'initialFetchDone:', initialFetchDone.current);
            if (initialFetchDone.current || !accessToken) return;
            
            try {
                initialFetchDone.current = true;
                const date = viewingDate.toLocaleDateString().replaceAll('/', '-');
                const tab = uiStore.selectedTab;
                console.log('📱 App: Starting initial fetch for date:', date, 'tab:', tab);

                if (tab === 'medicine') {
                    await medicineStore.fetchEntries(date, { accessToken, setAccessToken });
                    await medicineStore.fetchDayTotals({ accessToken, setAccessToken });
                } else if (tab === 'all') {
                    await Promise.all([
                        entryStore.fetchEntries(date, { accessToken, setAccessToken }),
                        medicineStore.fetchEntries(date, { accessToken, setAccessToken }),
                        medicineStore.fetchDayTotals({ accessToken, setAccessToken })
                    ]);
                } else {
                    await entryStore.fetchEntries(date, { accessToken, setAccessToken });
                }
                console.log('📱 App: Initial fetch completed successfully');
            } catch (error) {
                console.error('Failed to fetch initial data:', error);
                initialFetchDone.current = false; // Allow retry on error
            }
        };

        fetchInitialData();
    }, [accessToken]); // eslint-disable-line react-hooks/exhaustive-deps

    // Refetch data when viewing date changes
    useEffect(() => {
        if (!accessToken || initialFetchDone.current === false) return;

        const fetchDataForDate = async () => {
            const startTime = Date.now();
            setIsLoadingData(true);
            try {
                const date = viewingDate.toLocaleDateString().replaceAll('/', '-');
                const tab = uiStore.selectedTab;

                if (tab === 'medicine') {
                    await medicineStore.fetchEntries(date, { accessToken, setAccessToken });
                    await medicineStore.fetchDayTotals({ accessToken, setAccessToken });
                } else if (tab === 'all') {
                    await Promise.all([
                        entryStore.fetchEntries(date, { accessToken, setAccessToken }),
                        medicineStore.fetchEntries(date, { accessToken, setAccessToken }),
                        medicineStore.fetchDayTotals({ accessToken, setAccessToken })
                    ]);
                } else {
                    await entryStore.fetchEntries(date, { accessToken, setAccessToken });
                }
            } catch (error) {
                console.error('Failed to fetch data for date change:', error);
            } finally {
                // Ensure loading state lasts at least 1 second for better UX
                const elapsedTime = Date.now() - startTime;
                const remainingTime = Math.max(0, 250 - elapsedTime);
                setTimeout(() => {
                    setIsLoadingData(false);
                }, remainingTime);
            }
        };

        fetchDataForDate();
    }, [viewingDate, accessToken, setAccessToken, uiStore.selectedTab]); // eslint-disable-line react-hooks/exhaustive-deps

    const currentDate = new Date();
    const utcDate = currentDate.toISOString().split('T')[0];
    const localDateRaw = currentDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
    // Format local date to match UTC length: "MM/DD/YYYY" -> "MM-DD-YYYY"
    const localDate = localDateRaw.replace(/\//g, '-');
    // Pad the shorter string to ensure uniform visual length
    const utcDisplay = `${utcDate} (UTC)`;
    const localDisplay = `${localDate} (LOC)`;
    const maxLength = Math.max(utcDisplay.length, localDisplay.length);
    const paddedUtc = utcDisplay.padEnd(maxLength, ' ');
    const paddedLocal = localDisplay.padEnd(maxLength, ' ');

    const handleUpdate = useCallback((entry: MedicineEntry | Entry) => {
        const auth = { accessToken, setAccessToken };
        if ('text' in entry) {
            // It's an Entry
            entryStore.updateEntry(entry as Entry, auth);
        } else {
            // It's a MedicineEntry
            medicineStore.updateEntry(entry as MedicineEntry, auth);
        }
    }, [entryStore, medicineStore, accessToken, setAccessToken]);

    const handleDelete = useCallback((entry: MedicineEntry | Entry) => {
        const auth = { accessToken, setAccessToken };
        if ('text' in entry) {
            // It's an Entry
            entryStore.deleteEntry(entry as Entry, auth);
        } else {
            // It's a MedicineEntry
            medicineStore.deleteEntry(entry as MedicineEntry, auth);
        }
    }, [entryStore, medicineStore, accessToken, setAccessToken]);

    const handleTabChange = useCallback(async (tab: TabType) => {
        // Only fetch if tab actually changed
        if (uiStore.selectedTab === tab) return;
        
        uiStore.setSelectedTab(tab);
        const date = viewingDate.toLocaleDateString().replaceAll('/', '-');
        const auth = { accessToken, setAccessToken };

        try {
            if (tab === 'medicine') {
                await medicineStore.fetchEntries(date, auth);
                await medicineStore.fetchDayTotals(auth);
            } else if (tab === 'all') {
                await Promise.all([
                    entryStore.fetchEntries(date, auth),
                    medicineStore.fetchEntries(date, auth),
                    medicineStore.fetchDayTotals(auth)
                ]);
            } else {
                await entryStore.fetchEntries(date, auth);
            }
        } catch (error) {
            console.error('Failed to fetch data for tab change:', error);
        }
    }, [uiStore, accessToken, setAccessToken, viewingDate]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div
            className="page-container d-flex justify-content-center align-items-center flex-column w-full h-full">
            <div className="header-container w-full d-flex flex-row align-items-center">
                <DateDisplay 
                    utcTimeString={paddedUtc} 
                    localTimeString={paddedLocal}
                    viewingDate={viewingDate}
                    onDateChange={updateViewingDate}
                    onResetToToday={resetToToday}
                />
                <h1 className="font-bold">Tracker</h1>
            </div>
            
            <div className="main-content-container">
                {uiStore.selectedTab === 'medicine'
                    ? <StatsComponent entries={medicineStore.entries} dayTotals={medicineStore.dayTotals} selectedTab={uiStore.selectedTab} isLoading={isLoadingData} isToday={isToday} />
                    : <StatsComponent entries={entryStore.entries} dayTotals={medicineStore.dayTotals} selectedTab={uiStore.selectedTab} isLoading={isLoadingData} isToday={isToday} />}
                <Table
                    entries={uiStore.selectedTab === 'medicine' ? medicineStore.entries : uiStore.selectedTab === 'all' ? [] : entryStore.entries}
                    medicineEntries={uiStore.selectedTab === 'all' ? medicineStore.entries : undefined}
                    habitEntries={uiStore.selectedTab === 'all' ? entryStore.entries : undefined}
                    onDataChange={() => {}}
                    selectedTab={uiStore.selectedTab}
                    onTabChange={handleTabChange}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                    isLoading={isLoadingData}
                />
            </div>
            {<EntryTerminal
                ref={entryTerminalRef}
                entries={medicineStore.entries}
                onAddMedicine={async (entry) => {
                    try {
                        await medicineStore.addEntry(entry, { accessToken, setAccessToken });
                        toast.success('Medicine entry added', `${entry.name} (${entry.dose}mg) has been added successfully`);
                    } catch {
                        toast.error('Failed to add medicine entry', 'Please try again');
                    }
                }}
                onAddEntry={async (entry) => {
                    try {
                        await entryStore.addEntry(entry, { accessToken, setAccessToken });
                        toast.success('Entry added', `"${entry.text}" has been added successfully`);
                    } catch {
                        toast.error('Failed to add entry', 'Please try again');
                    }
                }}
                onUpdate={async (entry) => {
                    try {
                        await medicineStore.updateEntry(entry, { accessToken, setAccessToken });
                        toast.success('Medicine entry updated', 'Entry has been updated successfully');
                    } catch {
                        toast.error('Failed to update medicine entry', 'Please try again');
                    }
                }}
                onDelete={async (entry) => {
                    try {
                        await medicineStore.deleteEntry(entry, { accessToken, setAccessToken });
                        toast.success('Medicine entry deleted', 'Entry has been deleted successfully');
                    } catch {
                        toast.error('Failed to delete medicine entry', 'Please try again');
                    }
                }}
            />}
        </div>
    );
}

function App(): JSX.Element {
    return (
        <BrowserRouter>
            <ToastProvider>
                <ErrorBoundary>
                    <AppContent />
                    <ToastContainer />
                </ErrorBoundary>
            </ToastProvider>
        </BrowserRouter>
    );
}

export default memo(App);
