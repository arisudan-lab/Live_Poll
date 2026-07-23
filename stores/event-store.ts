// ============================================================================
// Event Feed Store (Zustand)
// ============================================================================

import { create } from "zustand";
import { ContractEvent } from "@/types";

interface EventStore {
  events: ContractEvent[];
  lastLedger: number;
  isPolling: boolean;
  addEvents: (events: ContractEvent[]) => void;
  setLastLedger: (ledger: number) => void;
  setPolling: (polling: boolean) => void;
  clearEvents: () => void;
}

export const useEventStore = create<EventStore>((set) => ({
  events: [],
  lastLedger: 0,
  isPolling: false,

  addEvents: (newEvents) => {
    set((state) => {
      const existingIds = new Set(state.events.map((e) => e.id));
      const uniqueNew = newEvents.filter((e) => !existingIds.has(e.id));
      if (uniqueNew.length === 0) return state;

      return {
        events: [...uniqueNew, ...state.events].slice(0, 100), // Keep last 100
      };
    });
  },

  setLastLedger: (ledger) => set({ lastLedger: ledger }),
  setPolling: (polling) => set({ isPolling: polling }),
  clearEvents: () => set({ events: [], lastLedger: 0 }),
}));
