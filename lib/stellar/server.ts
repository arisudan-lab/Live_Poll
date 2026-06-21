// ============================================================================
// Stellar RPC Server Instance
// ============================================================================

import { rpc } from "@stellar/stellar-sdk";
import { NETWORK_CONFIG } from "./config";

/**
 * Shared Soroban RPC server instance.
 * Used for all contract reads, transaction simulation, and submission.
 */
export const sorobanServer = new rpc.Server(NETWORK_CONFIG.rpcUrl, {
  allowHttp: NETWORK_CONFIG.rpcUrl.startsWith("http://"),
});
