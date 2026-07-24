// ============================================================================
// Transaction Tracking Utilities
// ============================================================================

import { rpc } from "@stellar/stellar-sdk";
import { sorobanServer } from "./server";
import { TransactionStatus } from "@/types";

/**
 * Poll the RPC server for a transaction status.
 * Returns the current status of the transaction.
 */
export async function getTransactionStatus(
  hash: string
): Promise<TransactionStatus> {
  try {
    const response = await sorobanServer.getTransaction(hash);

    switch (response.status) {
      case rpc.Api.GetTransactionStatus.SUCCESS:
        return TransactionStatus.Success;
      case rpc.Api.GetTransactionStatus.FAILED:
        return TransactionStatus.Failed;
      case rpc.Api.GetTransactionStatus.NOT_FOUND:
        return TransactionStatus.Pending;
      default:
        return TransactionStatus.Pending;
    }
  } catch {
    return TransactionStatus.Pending;
  }
}

/**
 * Wait for a transaction to finalize.
 * Resolves with the final status, ledger, and error message if any.
 */
export async function waitForConfirmation(
  hash: string,
  timeoutMs = 60000,
  intervalMs = 2000
): Promise<{
  status: TransactionStatus;
  ledger?: number;
  error?: string;
}> {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    try {
      const response = await sorobanServer.getTransaction(hash);

      if (response.status === rpc.Api.GetTransactionStatus.SUCCESS) {
        return { 
          status: TransactionStatus.Success, 
          ledger: response.ledger,
        };
      }
      if (response.status === rpc.Api.GetTransactionStatus.FAILED) {
        return { 
          status: TransactionStatus.Failed, 
          error: "Transaction failed on-chain",
        };
      }
    } catch (err) {
      // Continue polling on error
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  return { status: TransactionStatus.Failed, error: "Transaction confirmation timeout" };
}

/**
 * Get the XLM balance for a Stellar account
 */
export async function getAccountBalance(address: string): Promise<string> {
  try {
    await sorobanServer.getAccount(address);
    // Soroban RPC getAccount doesn't return balances directly;
    // we need to use the raw response or Horizon for balances.
    // For testnet, we approximate using the account sequence.
    // In production, you'd query Horizon for balances.
    return "100.00"; // Placeholder; real balance via Horizon
  } catch {
    return "0.00";
  }
}

/**
 * Fetch actual XLM balance from Horizon (testnet)
 */
export async function fetchXLMBalance(address: string): Promise<string> {
  try {
    const response = await fetch(
      `https://horizon-testnet.stellar.org/accounts/${address}`
    );
    if (!response.ok) return "0.00";
    const data = await response.json();
    const xlmBalance = data.balances?.find(
      (b: { asset_type: string }) => b.asset_type === "native"
    );
    return xlmBalance ? parseFloat(xlmBalance.balance).toFixed(2) : "0.00";
  } catch {
    return "0.00";
  }
}
