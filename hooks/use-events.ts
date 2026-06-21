// ============================================================================
// Event Polling Hook
// ============================================================================

"use client";

import { useEffect, useCallback } from "react";
import { useEventStore } from "@/stores/event-store";
import { fetchContractEvents, getLatestLedger } from "@/lib/stellar/events";

const POLL_INTERVAL = 8000; // Poll every 8 seconds

/**
 * Hook that sets up real-time event polling from the contract.
 * Events are fed into the event store for the activity feed.
 */
export function useEvents() {
  const { events, lastLedger, isPolling, addEvents, setLastLedger, setPolling } =
    useEventStore();

  const pollEvents = useCallback(async () => {
    try {
      const newEvents = await fetchContractEvents(
        lastLedger > 0 ? lastLedger : undefined
      );

      if (newEvents.length > 0) {
        addEvents(newEvents);
        // Update the last seen ledger
        const maxLedger = Math.max(...newEvents.map((e) => e.ledger));
        if (maxLedger > lastLedger) {
          setLastLedger(maxLedger + 1);
        }
      }
    } catch (error) {
      console.error("[Events] Polling error:", error);
    }
  }, [lastLedger, addEvents, setLastLedger]);

  useEffect(() => {
    // Initial fetch
    pollEvents();

    // Set up polling interval
    const interval = setInterval(pollEvents, POLL_INTERVAL);
    setPolling(true);

    return () => {
      clearInterval(interval);
      setPolling(false);
    };
  }, [pollEvents, setPolling]);

  return { events, isPolling };
}
