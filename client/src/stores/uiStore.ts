import { create } from 'zustand';
import type { TabType } from '../types/interfaces';

function getTabFromQuery(search: string): TabType {
    const params = new URLSearchParams(search);
    const tab = params.get('tab');
    return (tab as TabType) || 'all';
}

interface UiStore {
  // State
  selectedTab: TabType;

  // Actions
  setSelectedTab: (tab: TabType) => void;
}

export const useUiStore = create<UiStore>((set) => ({
  // Initial state
  selectedTab: getTabFromQuery(window.location.search),

  // Actions
  setSelectedTab: (tab: TabType) => {
    set({ selectedTab: tab });
    // Update URL
    const params = new URLSearchParams(window.location.search);
    params.set('tab', tab);
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
  },
}));
