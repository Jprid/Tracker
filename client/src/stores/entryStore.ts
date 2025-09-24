import { create } from 'zustand';
import type { Entry, AuthParams } from '../types/interfaces';
import { request } from '../services/ApiClient';
import { mapEntries } from '../utils/transforms';

interface EntryStore {
  // State
  entries: Entry[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchEntries: (date: string, auth: AuthParams) => Promise<void>;
  addEntry: (entry: { text: string; completed: boolean }, auth: AuthParams) => Promise<void>;
  updateEntry: (entry: Entry, auth: AuthParams) => Promise<void>;
  deleteEntry: (entry: Entry, auth: AuthParams) => Promise<void>;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useEntryStore = create<EntryStore>((set, get) => ({
  // Initial state
  entries: [],
  isLoading: false,
  error: null,

  // Actions
  fetchEntries: async (date: string, auth: AuthParams) => {
    // Prevent duplicate requests
    if (get().isLoading) return;
    
    set({ isLoading: true, error: null });
    try {
      const ENTRIES_ROUTE_BASE = `${import.meta.env.VITE_API_BASE_URL}`;
      const response = await request(`${ENTRIES_ROUTE_BASE}/entries/${date}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + auth.accessToken
        },
      }, auth.accessToken, auth.setAccessToken);

      if (!response.ok) {
        throw new Error('Failed to fetch entries');
      }

      const json = await response.json();
      const mappedEntries = mapEntries(json.entries);
      set({ entries: mappedEntries, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch entries:', error);
      set({ error: 'Failed to fetch entries', isLoading: false });
    }
  },

  addEntry: async (entry: { text: string; completed: boolean }, auth: AuthParams) => {
    set({ isLoading: true, error: null });
    try {
      const ENTRIES_ROUTE_BASE = `${import.meta.env.VITE_API_BASE_URL}`;
      const response = await request(`${ENTRIES_ROUTE_BASE}/entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + auth.accessToken
        },
        body: JSON.stringify({
          text: entry.text,
          completed: entry.completed,
        })
      }, auth.accessToken, auth.setAccessToken);

      if (!response.ok) {
        throw new Error('Failed to add entry');
      }

      const json = await response.json();
      const createdAt = new Date().toISOString();
      const newEntry: Entry = {
        id: json.id,
        text: entry.text,
        completed: entry.completed,
        created_at: createdAt,
        completed_at: undefined,
        displayTime: new Date(createdAt + 'Z').toLocaleString('en-US', {
          hour: '2-digit', minute: '2-digit', hour12: true,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        })
      };
      set((state) => ({ entries: [...state.entries, newEntry], isLoading: false }));
    } catch (error) {
      set({ isLoading: false });
      throw error; // Re-throw to let caller handle
    }
  },

  updateEntry: async (entry: Entry, auth: AuthParams) => {
    set({ isLoading: true, error: null });
    try {
      const ENTRIES_ROUTE_BASE = `${import.meta.env.VITE_API_BASE_URL}`;
      const response = await request(`${ENTRIES_ROUTE_BASE}/entries`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + auth.accessToken
        },
        body: JSON.stringify({
          id: entry.id,
          text: entry.text,
          completed: entry.completed,
          completed_at: entry.completed_at,
        })
      }, auth.accessToken, auth.setAccessToken);

      if (!response.ok) {
        throw new Error('Failed to update entry');
      }

      set((state) => ({ entries: state.entries.map(e => e.id === entry.id ? entry : e), isLoading: false }));
    } catch (error) {
      set({ isLoading: false });
      throw error; // Re-throw to let caller handle
    }
  },

  deleteEntry: async (entry: Entry, auth: AuthParams) => {
    set({ isLoading: true, error: null });
    try {
      const ENTRIES_ROUTE_BASE = `${import.meta.env.VITE_API_BASE_URL}`;
      const response = await request(`${ENTRIES_ROUTE_BASE}/entries`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + auth.accessToken
        },
        body: JSON.stringify({
          id: entry.id,
        })
      }, auth.accessToken, auth.setAccessToken);

      if (!response.ok) {
        throw new Error('Failed to delete entry');
      }

      set((state) => ({ entries: state.entries.filter(e => e.id !== entry.id), isLoading: false }));
    } catch (error) {
      set({ isLoading: false });
      throw error; // Re-throw to let caller handle
    }
  },

  setError: (error: string | null) => set({ error }),
  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));
