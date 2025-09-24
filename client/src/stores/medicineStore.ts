import { create } from 'zustand';
import type { MedicineEntry, DataPoint, AuthParams } from '../types/interfaces';
import { request } from '../services/ApiClient';
import { transformEntriesToDataPoints, mapMedicineEntries } from '../utils/transforms';

interface MedicineStore {
  // State
  entries: MedicineEntry[];
  dayTotals: DataPoint[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchEntries: (date: string, auth: AuthParams) => Promise<void>;
  fetchDayTotals: (auth: AuthParams) => Promise<void>;
  addEntry: (entry: { name: string; dose: number }, auth: AuthParams) => Promise<void>;
  updateEntry: (entry: MedicineEntry, auth: AuthParams) => Promise<void>;
  deleteEntry: (entry: MedicineEntry, auth: AuthParams) => Promise<void>;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useMedicineStore = create<MedicineStore>((set, get) => ({
  // Initial state
  entries: [],
  dayTotals: [],
  isLoading: false,
  error: null,

  // Actions
  fetchEntries: async (date: string, auth: AuthParams) => {
    console.log('🏥 MedicineStore.fetchEntries called with date:', date, 'and auth:', !!auth.accessToken);
    // Prevent duplicate requests
    if (get().isLoading) return;
    
    set({ isLoading: true, error: null });
    try {
      const MEDICINE_ROUTE_BASE = `${import.meta.env.VITE_API_BASE_URL}/medicine`;
      const response = await request(`${MEDICINE_ROUTE_BASE}/${date}`, {
        method: 'GET',
        headers: createRequestHeaders(auth.accessToken),
      }, auth.accessToken, auth.setAccessToken);

      if (!response.ok) {
        throw new Error('Failed to fetch medicine entries');
      }

      const json = await response.json();
      const mappedEntries = mapMedicineEntries(json.entries);
      set({ entries: mappedEntries, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch medicine entries:', error);
      set({ error: 'Failed to fetch medicine entries', isLoading: false });
    }
  },

  fetchDayTotals: async (auth: AuthParams) => {
    set({ error: null });
    try {
      const MEDICINE_ROUTE_BASE = `${import.meta.env.VITE_API_BASE_URL}/medicine`;
      
      // First get available substances
      const substancesResponse = await request(`${MEDICINE_ROUTE_BASE}/substances`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + auth.accessToken
        },
      }, auth.accessToken, auth.setAccessToken);

      if (!substancesResponse.ok) {
        throw new Error('Failed to fetch substances');
      }

      const substancesJson = await substancesResponse.json();
      const availableSubstances = substancesJson.substances || [];
      
      if (availableSubstances.length === 0) {
        console.warn('No substances available for day totals');
        set({ dayTotals: [] });
        return;
      }

      // Use the first available substance for day totals
      const substanceForTotals = availableSubstances[0];
      console.log('📊 Using substance for day totals:', substanceForTotals);
      
      const response = await request(`${MEDICINE_ROUTE_BASE}/${substanceForTotals.toLowerCase()}/pivot`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + auth.accessToken
        },
      }, auth.accessToken, auth.setAccessToken);

      if (!response.ok) {
        throw new Error('Failed to fetch day totals');
      }

      const json = await response.json();
      // Check if data.entries is already in DataPoint format (fake data) or needs transformation
      let dayTotals: DataPoint[];
      if (json.entries && json.entries.length > 0 && 'day' in json.entries[0] && typeof json.entries[0].day === 'number') {
        // Already in correct format (fake data)
        dayTotals = json.entries;
      } else {
        // Needs transformation (real API data)
        dayTotals = transformEntriesToDataPoints(json.entries);
      }
      set({ dayTotals });
    } catch (error) {
      console.error('Failed to fetch day totals:', error);
      set({ error: 'Failed to fetch day totals' });
    }
  },

  addEntry: async (entry: { name: string; dose: number }, auth: AuthParams) => {
    set({ isLoading: true, error: null });
    try {
      const MEDICINE_ROUTE_BASE = `${import.meta.env.VITE_API_BASE_URL}/medicine`;
      const date = new Date().toISOString().split('T')[0];

      const response = await request(`${MEDICINE_ROUTE_BASE}/${date}/create`, {
        method: 'POST',
        headers: createRequestHeaders(auth.accessToken),
        body: JSON.stringify({
          habit_name: entry.name,
          dose: entry.dose,
        })
      }, auth.accessToken, auth.setAccessToken);

      if (!response.ok) {
        throw new Error('Failed to add medicine entry');
      }

      const json = await response.json();
      const createdAt = new Date().toISOString();
      const newEntry: MedicineEntry = {
        id: json.id,
        name: entry.name,
        dose: entry.dose,
        created_at: createdAt,
        displayTime: new Date(createdAt + 'Z').toLocaleString('en-US', {
          hour: '2-digit', minute: '2-digit', hour12: true,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        })
      };
      set((state) => ({ entries: [...state.entries, newEntry], isLoading: false }));
      // Refresh dayTotals as it may have changed
      await get().fetchDayTotals(auth);
    } catch (error) {
      set({ isLoading: false });
      throw error; // Re-throw to let caller handle
    }
  },

  updateEntry: async (entry: MedicineEntry, auth: AuthParams) => {
    set({ isLoading: true, error: null });
    try {
      const MEDICINE_ROUTE_BASE = `${import.meta.env.VITE_API_BASE_URL}/medicine`;
      const response = await request(`${MEDICINE_ROUTE_BASE}/update`, {
        method: 'PUT',
        headers: createRequestHeaders(auth.accessToken),
        body: JSON.stringify({
          id: entry.id,
          name: entry.name,
          dose: entry.dose,
          created_at: entry.created_at,
        })
      }, auth.accessToken, auth.setAccessToken);

      if (!response.ok) {
        throw new Error('Failed to update medicine entry');
      }

      set((state) => ({ entries: state.entries.map(e => e.id === entry.id ? entry : e), isLoading: false }));
      // Refresh dayTotals as it may have changed
      await get().fetchDayTotals(auth);
    } catch (error) {
      set({ isLoading: false });
      throw error; // Re-throw to let caller handle
    }
  },

  deleteEntry: async (entry: MedicineEntry, auth: AuthParams) => {
    set({ isLoading: true, error: null });
    try {
      const MEDICINE_ROUTE_BASE = `${import.meta.env.VITE_API_BASE_URL}/medicine`;
      const response = await request(`${MEDICINE_ROUTE_BASE}/delete`, {
        method: 'DELETE',
        headers: createRequestHeaders(auth.accessToken),
        body: JSON.stringify({
          id: entry.id,
        })
      }, auth.accessToken, auth.setAccessToken);

      if (!response.ok) {
        throw new Error('Failed to delete medicine entry');
      }

      set((state) => ({ entries: state.entries.filter(e => e.id !== entry.id), isLoading: false }));
      // Refresh dayTotals as it may have changed
      await get().fetchDayTotals(auth);
    } catch (error) {
      set({ isLoading: false });
      throw error; // Re-throw to let caller handle
    }
  },

  setError: (error: string | null) => set({ error }),
  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));

function createRequestHeaders(accessToken: string | undefined): HeadersInit | undefined {
  return {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + accessToken
  };
}

