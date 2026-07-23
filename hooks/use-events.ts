// ============================================================================
// Event Polling Hook
// ============================================================================

"use client";

import { useEffect, useCallback } from "react";
import { useEventStore } from "@/stores/event-store";
import { fetchContractEvents } from "@/lib/stellar/events";
import { ContractEvent, ContractEventType } from "@/types";

const POLL_INTERVAL = 8000; // Poll every 8 seconds

const MOCK_EVENTS: ContractEvent[] = [
  {
    id: "evt_1",
    type: ContractEventType.VoteCast,
    timestamp: Date.now() - 300000, // 5 mins ago
    walletAddress: "GBX...ABCD",
    action: "Cast a vote on 'Favorite Smart Contract Language'",
    pollId: 1,
    pollTitle: "Favorite Smart Contract Language",
    optionIndex: 0,
    txHash: "7a8bc9d0...f1e2",
    ledger: 10005,
  },
  {
    id: "evt_2",
    type: ContractEventType.PollCreated,
    timestamp: Date.now() - 3600000, // 1 hour ago
    walletAddress: "GDZ...1234",
    action: "Created a new poll 'Monthly Community Call Time'",
    pollId: 3,
    pollTitle: "Monthly Community Call Time",
    txHash: "b2c3d4e5...a1b2",
    ledger: 10000,
  },
  {
    id: "evt_3",
    type: ContractEventType.PollClosed,
    timestamp: Date.now() - 86400000, // 1 day ago
    walletAddress: "GCY...WXYZ",
    action: "Closed poll 'Next Platform Feature'",
    pollId: 2,
    pollTitle: "Next Platform Feature",
    txHash: "9f8e7d6c...b5a4",
    ledger: 9500,
  }
];

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
      } else if (events.length === 0 && lastLedger === 0) {
        // Fallback to mock data if no events and we are just starting
        addEvents(MOCK_EVENTS);
      }
    } catch (error) {
      console.error("[Events] Polling error. Falling back to mock data:", error);
      if (events.length === 0) {
        addEvents(MOCK_EVENTS);
      }
    }
  }, [lastLedger, addEvents, setLastLedger, events.length]);

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
