// ============================================================================
// Event Streaming Hook with Real-Time Updates
// ============================================================================

"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { fetchContractEvents } from "@/lib/stellar/events";
import { ContractEvent, ContractEventType } from "@/types";
import { useEventStore } from "@/stores/event-store";

interface UseEventsReturn {
  events: ContractEvent[];
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  isPolling: boolean;
  lastUpdate: number | null;
  pollCount: number;
  refresh: () => Promise<void>;
  subscribeToType: (type: ContractEventType) => void;
  unsubscribeFromAll: () => void;
}

const POLL_INTERVAL_MS = 5000; // 5 seconds
const MAX_EVENTS = 100;

// Mock events as fallback
const MOCK_EVENTS: ContractEvent[] = [
  {
    id: "evt_mock_1",
    type: ContractEventType.VoteCast,
    timestamp: Date.now() - 300000,
    walletAddress: "GBX...ABCD",
    action: "Cast a vote on 'Favorite Smart Contract Language'",
    pollId: 1,
    pollTitle: "Favorite Smart Contract Language",
    optionIndex: 0,
    txHash: "7a8bc9d0f1e2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8",
    ledger: 10005,
  },
  {
    id: "evt_mock_2",
    type: ContractEventType.PollCreated,
    timestamp: Date.now() - 3600000,
    walletAddress: "GDZ...1234",
    action: "Created a new poll 'Monthly Community Call Time'",
    pollId: 3,
    pollTitle: "Monthly Community Call Time",
    txHash: "b2c3d4e5a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8",
    ledger: 10000,
  },
  {
    id: "evt_mock_3",
    type: ContractEventType.PollClosed,
    timestamp: Date.now() - 86400000,
    walletAddress: "GCY...WXYZ",
    action: "Closed poll 'Next Platform Feature'",
    pollId: 2,
    pollTitle: "Next Platform Feature",
    txHash: "9f8e7d6cb5a4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8",
    ledger: 9500,
  },
];

/**
 * Hook for real-time contract event streaming
 * Features:
 * - Auto-polling with configurable interval
 * - Deduplication of events
 * - Type filtering
 * - Manual refresh
 * - Connection state tracking
 * - Mock data fallback
 */
export function useEvents(): UseEventsReturn {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<number | null>(null);
  const [pollCount, setPollCount] = useState(0);

  const { events, addEvents, getEventIds } = useEventStore();
  const hasInitializedRef = useRef(false);

  // Fetch new events
  const fetchNewEvents = useCallback(async () => {
    try {
      setIsError(false);
      
      const newEvents = await fetchContractEvents(undefined, MAX_EVENTS);
      
      if (newEvents.length === 0) {
        // Fallback to mock data on first load if no real events
        if (!hasInitializedRef.current && events.length === 0) {
          addEvents(MOCK_EVENTS);
          hasInitializedRef.current = true;
        }
        setIsLoading(false);
        return;
      }

      // Deduplicate events
      const existingIds = getEventIds();
      const uniqueEvents = newEvents.filter(
        (event) => !existingIds.has(event.id)
      );

      if (uniqueEvents.length > 0) {
        addEvents(uniqueEvents);
        setLastUpdate(Date.now());
        hasInitializedRef.current = true;
      }

      setPollCount((prev) => prev + 1);
      setIsLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch events";
      setError(errorMessage);
      setIsError(true);
      setIsLoading(false);
      console.error("[Events] Fetch error:", err);
      
      // Fallback to mock data on error
      if (!hasInitializedRef.current && events.length === 0) {
        addEvents(MOCK_EVENTS);
        hasInitializedRef.current = true;
      }
    }
  }, [addEvents, getEventIds, events.length]);

  // Initial fetch
  useEffect(() => {
    fetchNewEvents();
  }, [fetchNewEvents]);

  // Auto-polling
  useEffect(() => {
    if (!isPolling) return;

    const intervalId = setInterval(() => {
      fetchNewEvents();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [isPolling, fetchNewEvents]);

  // Manual refresh
  const refresh = useCallback(async () => {
    setIsLoading(true);
    await fetchNewEvents();
  }, [fetchNewEvents]);

  // Subscribe to specific event type (filter)
  const subscribeToType = useCallback(
    (type: ContractEventType) => {
      // This could be extended to filter at the store level
      console.log("[Events] Subscribed to type:", type);
    },
    []
  );

  // Unsubscribe from all filters
  const unsubscribeFromAll = useCallback(() => {
    console.log("[Events] Unsubscribed from all filters");
  }, []);

  return {
    events: events.slice(0, 50), // Show last 50 events
    isLoading,
    isError,
    error,
    isPolling,
    lastUpdate,
    pollCount,
    refresh,
    subscribeToType,
    unsubscribeFromAll,
  };
}

/**
 * Hook for a single event type subscription
 */
export function useEventSubscription(type: ContractEventType): {
  events: ContractEvent[];
  count: number;
  lastEvent: ContractEvent | null;
} {
  const { events } = useEvents();
  
  const filteredEvents = events.filter((event) => event.type === type);
  const lastEvent = filteredEvents.length > 0 ? filteredEvents[0] : null;

  return {
    events: filteredEvents,
    count: filteredEvents.length,
    lastEvent,
  };
}

/**
 * Hook for event statistics
 */
export function useEventStats() {
  const { events } = useEvents();

  const stats = {
    total: events.length,
    pollCreated: events.filter((e) => e.type === ContractEventType.PollCreated).length,
    voteCast: events.filter((e) => e.type === ContractEventType.VoteCast).length,
    pollClosed: events.filter((e) => e.type === ContractEventType.PollClosed).length,
  };

  return stats;
}
