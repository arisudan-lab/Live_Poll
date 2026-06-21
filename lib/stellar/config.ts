// ============================================================================
// Stellar Network Configuration
// ============================================================================

import { NetworkConfig } from "@/types";

export const NETWORK_CONFIG: NetworkConfig = {
  network: process.env.NEXT_PUBLIC_STELLAR_NETWORK || "testnet",
  networkPassphrase:
    process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE ||
    "Test SDF Network ; September 2015",
  rpcUrl:
    process.env.NEXT_PUBLIC_STELLAR_RPC_URL ||
    "https://soroban-testnet.stellar.org",
  explorerUrl:
    process.env.NEXT_PUBLIC_EXPLORER_URL ||
    "https://stellar.expert/explorer/testnet",
  contractId:
    process.env.NEXT_PUBLIC_CONTRACT_ID || "CONTRACT_ADDRESS_HERE",
};

/**
 * Build an explorer URL for a transaction hash
 */
export function getExplorerTxUrl(hash: string): string {
  return `${NETWORK_CONFIG.explorerUrl}/tx/${hash}`;
}

/**
 * Build an explorer URL for an account address
 */
export function getExplorerAccountUrl(address: string): string {
  return `${NETWORK_CONFIG.explorerUrl}/account/${address}`;
}

/**
 * Truncate a Stellar address for display
 */
export function truncateAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Format a Unix timestamp to a readable string
 */
export function formatTimestamp(timestamp: number): string {
  if (!timestamp) return "N/A";
  return new Date(timestamp * 1000).toLocaleString();
}

/**
 * Format relative time (e.g., "2 minutes ago")
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
