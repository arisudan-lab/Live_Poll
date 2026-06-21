// ============================================================================
// Smart Contract Interaction Layer
// ============================================================================

import {
  Contract,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  xdr,
  Address,
  nativeToScVal,
  scValToNative,
  rpc,
} from "@stellar/stellar-sdk";
import { NETWORK_CONFIG } from "./config";
import { sorobanServer } from "./server";
import { Poll, PollOption, PollStatus } from "@/types";

function getContract(): Contract {
  if (!NETWORK_CONFIG.contractId || !NETWORK_CONFIG.contractId.startsWith("C") || NETWORK_CONFIG.contractId.length !== 56) {
    throw new Error("Invalid or missing contract ID. Please set NEXT_PUBLIC_CONTRACT_ID.");
  }
  return new Contract(NETWORK_CONFIG.contractId);
}

// ─── Helper: Convert network name to passphrase ────────────────────────────

function getNetworkPassphrase(): string {
  return NETWORK_CONFIG.networkPassphrase;
}

// ─── Helper: Build ScVal from JS types ─────────────────────────────────────

function stringToScVal(str: string): xdr.ScVal {
  return nativeToScVal(str, { type: "string" });
}

function u32ToScVal(num: number): xdr.ScVal {
  return nativeToScVal(num, { type: "u32" });
}

function u64ToScVal(num: number): xdr.ScVal {
  return nativeToScVal(num, { type: "u64" });
}

function addressToScVal(address: string): xdr.ScVal {
  return new Address(address).toScVal();
}

function vecOfStringsToScVal(strings: string[]): xdr.ScVal {
  return xdr.ScVal.scvVec(strings.map((s) => stringToScVal(s)));
}

// ─── Parse Poll from Contract Response ─────────────────────────────────────

function parsePoll(scVal: xdr.ScVal): Poll {
  const raw = scValToNative(scVal);
  return {
    id: Number(raw.id),
    creator: raw.creator,
    title: raw.title,
    description: raw.description,
    options: (raw.options as Array<{ label: string; vote_count: number }>).map(
      (opt) => ({
        label: opt.label,
        voteCount: Number(opt.vote_count),
      })
    ),
    totalVotes: Number(raw.total_votes),
    status: parsePollStatus(raw.status),
    endTime: Number(raw.end_time),
    createdAt: Number(raw.created_at),
  };
}

function parsePollStatus(status: { toString(): string } | string): PollStatus {
  const s = typeof status === "string" ? status : String(status);
  if (s.includes("Closed") || s === "closed") return PollStatus.Closed;
  if (s.includes("Ended") || s === "ended") return PollStatus.Ended;
  return PollStatus.Active;
}

// ─── Read-Only Contract Queries ────────────────────────────────────────────

/**
 * Get a single poll by ID (read-only)
 */
export async function getPoll(pollId: number): Promise<Poll> {
  const account = await sorobanServer.getAccount(
    "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF6"
  );

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: getNetworkPassphrase(),
  })
    .addOperation(getContract().call("get_poll", u32ToScVal(pollId)))
    .setTimeout(30)
    .build();

  const response = await sorobanServer.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(response)) {
    throw new Error(`Failed to read poll: ${response.error}`);
  }

  const result = (response as rpc.Api.SimulateTransactionSuccessResponse).result;
  if (!result) throw new Error("No result from simulation");
  return parsePoll(result.retval);
}

/**
 * Get paginated list of polls (read-only)
 */
export async function getPolls(
  start: number = 0,
  limit: number = 20
): Promise<Poll[]> {
  const account = await sorobanServer.getAccount(
    "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF6"
  );

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: getNetworkPassphrase(),
  })
    .addOperation(
      getContract().call("get_polls", u32ToScVal(start), u32ToScVal(limit))
    )
    .setTimeout(30)
    .build();

  const response = await sorobanServer.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(response)) {
    throw new Error(`Failed to read polls: ${response.error}`);
  }

  const result = (response as rpc.Api.SimulateTransactionSuccessResponse).result;
  if (!result) return [];

  const raw = scValToNative(result.retval);
  if (!Array.isArray(raw)) return [];
  return raw.map((item: xdr.ScVal) =>
    parsePoll(nativeToScVal(item))
  );
}

/**
 * Get total number of polls (read-only)
 */
export async function getPollCount(): Promise<number> {
  const account = await sorobanServer.getAccount(
    "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF6"
  );

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: getNetworkPassphrase(),
  })
    .addOperation(getContract().call("get_poll_count"))
    .setTimeout(30)
    .build();

  const response = await sorobanServer.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(response)) {
    return 0;
  }

  const result = (response as rpc.Api.SimulateTransactionSuccessResponse).result;
  if (!result) return 0;
  return Number(scValToNative(result.retval));
}

/**
 * Check if a voter has already voted on a poll (read-only)
 */
export async function getVoter(
  pollId: number,
  voter: string
): Promise<boolean> {
  const account = await sorobanServer.getAccount(
    "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF6"
  );

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: getNetworkPassphrase(),
  })
    .addOperation(
      getContract().call("get_voter", u32ToScVal(pollId), addressToScVal(voter))
    )
    .setTimeout(30)
    .build();

  const response = await sorobanServer.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(response)) {
    return false;
  }

  const result = (response as rpc.Api.SimulateTransactionSuccessResponse).result;
  if (!result) return false;
  return Boolean(scValToNative(result.retval));
}

// ─── Write Operations (Build unsigned XDR) ─────────────────────────────────

/**
 * Build a create_poll transaction XDR for wallet signing
 */
export async function buildCreatePollTx(
  creator: string,
  title: string,
  description: string,
  options: string[],
  endTime: number
): Promise<string> {
  const account = await sorobanServer.getAccount(creator);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: getNetworkPassphrase(),
  })
    .addOperation(
      getContract().call(
        "create_poll",
        addressToScVal(creator),
        stringToScVal(title),
        stringToScVal(description),
        vecOfStringsToScVal(options),
        u64ToScVal(endTime)
      )
    )
    .setTimeout(300)
    .build();

  const simulated = await sorobanServer.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(simulated)) {
    throw new Error(`Simulation failed: ${simulated.error}`);
  }

  const prepared = rpc.assembleTransaction(tx, simulated).build();
  return prepared.toXDR();
}

/**
 * Build a vote transaction XDR for wallet signing
 */
export async function buildVoteTx(
  voter: string,
  pollId: number,
  optionIndex: number
): Promise<string> {
  const account = await sorobanServer.getAccount(voter);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: getNetworkPassphrase(),
  })
    .addOperation(
      getContract().call(
        "vote",
        addressToScVal(voter),
        u32ToScVal(pollId),
        u32ToScVal(optionIndex)
      )
    )
    .setTimeout(300)
    .build();

  const simulated = await sorobanServer.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(simulated)) {
    throw new Error(`Simulation failed: ${simulated.error}`);
  }

  const prepared = rpc.assembleTransaction(tx, simulated).build();
  return prepared.toXDR();
}

/**
 * Build a close_poll transaction XDR for wallet signing
 */
export async function buildClosePollTx(
  creator: string,
  pollId: number
): Promise<string> {
  const account = await sorobanServer.getAccount(creator);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: getNetworkPassphrase(),
  })
    .addOperation(
      getContract().call("close_poll", addressToScVal(creator), u32ToScVal(pollId))
    )
    .setTimeout(300)
    .build();

  const simulated = await sorobanServer.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(simulated)) {
    throw new Error(`Simulation failed: ${simulated.error}`);
  }

  const prepared = rpc.assembleTransaction(tx, simulated).build();
  return prepared.toXDR();
}

// ─── Submit Signed Transaction ─────────────────────────────────────────────

/**
 * Submit a signed transaction XDR and return the hash
 */
export async function submitTransaction(signedXdr: string): Promise<string> {
  const tx = TransactionBuilder.fromXDR(signedXdr, getNetworkPassphrase());
  const response = await sorobanServer.sendTransaction(tx);

  if (response.status === "ERROR") {
    throw new Error(`Transaction submission failed: ${response.errorResult?.toXDR("base64")}`);
  }

  return response.hash;
}

/**
 * Wait for a transaction to complete and return its status
 */
export async function waitForTransaction(
  hash: string,
  maxAttempts = 30,
  intervalMs = 2000
): Promise<rpc.Api.GetTransactionResponse> {
  for (let i = 0; i < maxAttempts; i++) {
    const response = await sorobanServer.getTransaction(hash);
    if (response.status !== rpc.Api.GetTransactionStatus.NOT_FOUND) {
      return response;
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  throw new Error("Transaction confirmation timeout");
}
