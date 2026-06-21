// ============================================================================
// Contract Event Fetching & Parsing
// ============================================================================

import { rpc, xdr, scValToNative } from "@stellar/stellar-sdk";
import { sorobanServer } from "./server";
import { NETWORK_CONFIG } from "./config";
import { ContractEvent, ContractEventType } from "@/types";

/**
 * Fetch recent contract events from the Soroban RPC.
 * Uses getEvents with topic filters for our contract.
 */
export async function fetchContractEvents(
  startLedger?: number,
  limit: number = 50
): Promise<ContractEvent[]> {
  try {
    const latestLedger = await sorobanServer.getLatestLedger();
    const effectiveStartLedger =
      startLedger || Math.max(1, latestLedger.sequence - 10000);

    const response = await sorobanServer.getEvents({
      startLedger: effectiveStartLedger,
      filters: [
        {
          type: "contract",
          contractIds: [NETWORK_CONFIG.contractId],
        },
      ],
      limit,
    });

    if (!response.events || response.events.length === 0) {
      return [];
    }

    return response.events
      .map(parseContractEvent)
      .filter((e): e is ContractEvent => e !== null)
      .sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error("Failed to fetch contract events:", error);
    return [];
  }
}

/**
 * Parse a raw Soroban event into our ContractEvent type
 */
function parseContractEvent(
  event: rpc.Api.EventResponse
): ContractEvent | null {
  try {
    const topics = event.topic.map((t) => scValToNative(t as xdr.ScVal));
    const eventType = parseEventType(String(topics[0]));
    if (!eventType) return null;

    const value = event.value
      ? scValToNative(event.value as xdr.ScVal)
      : {};

    const timestamp = Math.floor(Date.now() / 1000); // Approximate; ledger close time
    const walletAddress = extractAddress(topics, value);
    const pollId = extractPollId(topics, value);

    return {
      id: `${event.id}`,
      type: eventType,
      timestamp,
      walletAddress,
      action: getActionDescription(eventType, value),
      pollId,
      pollTitle: value?.title || undefined,
      optionIndex: value?.option_index !== undefined ? Number(value.option_index) : undefined,
      txHash: event.id || "",
      ledger: event.ledger,
    };
  } catch (error) {
    console.error("Failed to parse event:", error);
    return null;
  }
}

function parseEventType(topic: string): ContractEventType | null {
  if (topic.includes("poll_created")) return ContractEventType.PollCreated;
  if (topic.includes("vote_cast")) return ContractEventType.VoteCast;
  if (topic.includes("poll_closed")) return ContractEventType.PollClosed;
  return null;
}

function extractAddress(topics: unknown[], value: Record<string, unknown>): string {
  // Try from topics first, then value
  for (const t of topics) {
    if (typeof t === "string" && t.startsWith("G") && t.length === 56) {
      return t;
    }
  }
  if (typeof value?.creator === "string") return value.creator;
  if (typeof value?.voter === "string") return value.voter;
  return "Unknown";
}

function extractPollId(topics: unknown[], value: Record<string, unknown>): number | undefined {
  if (typeof value?.poll_id === "number") return value.poll_id;
  for (const t of topics) {
    if (typeof t === "number") return t;
  }
  return undefined;
}

function getActionDescription(
  type: ContractEventType,
  value: Record<string, unknown>
): string {
  switch (type) {
    case ContractEventType.PollCreated:
      return `Created poll "${value?.title || "Unknown"}"`;
    case ContractEventType.VoteCast:
      return `Voted on poll #${value?.poll_id || "?"}`;
    case ContractEventType.PollClosed:
      return `Closed poll #${value?.poll_id || "?"}`;
    default:
      return "Unknown action";
  }
}

/**
 * Get the latest ledger sequence for pagination
 */
export async function getLatestLedger(): Promise<number> {
  const result = await sorobanServer.getLatestLedger();
  return result.sequence;
}
