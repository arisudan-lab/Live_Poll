// ============================================================================
// Live Poll DApp - Type Definitions
// ============================================================================

/** Status of a poll */
export enum PollStatus {
  Active = "active",
  Closed = "closed",
  Ended = "ended",
}

/** A single option within a poll */
export interface PollOption {
  label: string;
  voteCount: number;
}

/** Complete poll data from the contract */
export interface Poll {
  id: number;
  creator: string;
  title: string;
  description: string;
  options: PollOption[];
  totalVotes: number;
  status: PollStatus;
  endTime: number; // Unix timestamp, 0 = no end time
  createdAt: number; // Unix timestamp
}

/** A vote record */
export interface Vote {
  pollId: number;
  voter: string;
  optionIndex: number;
  timestamp: number;
}

/** Types of contract events */
export enum ContractEventType {
  PollCreated = "poll_created",
  VoteCast = "vote_cast",
  PollClosed = "poll_closed",
}

/** A contract event from the activity feed */
export interface ContractEvent {
  id: string;
  type: ContractEventType;
  timestamp: number;
  walletAddress: string;
  action: string;
  pollId?: number;
  pollTitle?: string;
  optionIndex?: number;
  txHash: string;
  ledger: number;
}

/** Transaction status */
export enum TransactionStatus {
  Pending = "pending",
  Success = "success",
  Failed = "failed",
}

/** Transaction type categories */
export enum TransactionType {
  CreatePoll = "create_poll",
  CastVote = "cast_vote",
  ClosePoll = "close_poll",
}

/** A tracked transaction */
export interface TransactionRecord {
  hash: string;
  status: TransactionStatus;
  type: TransactionType;
  explorerLink: string;
  timestamp: number;
  description: string;
  errorMessage?: string;
}

/** Wallet connection state */
export interface WalletState {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  network: string;
  balance: string | null;
}

/** Network configuration */
export interface NetworkConfig {
  networkPassphrase: string;
  rpcUrl: string;
  explorerUrl: string;
  contractId: string;
  network: string;
}

/** Form data for creating a poll */
export interface CreatePollForm {
  title: string;
  description: string;
  options: string[];
  endTime?: Date;
}

/** Error types for wallet interactions */
export enum WalletErrorType {
  NotInstalled = "not_installed",
  UserRejected = "user_rejected",
  InsufficientBalance = "insufficient_balance",
  NetworkError = "network_error",
  Unknown = "unknown",
}

/** Structured wallet error */
export interface WalletError {
  type: WalletErrorType;
  message: string;
  originalError?: unknown;
}
