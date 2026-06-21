// ============================================================================
// Wallet Integration Layer (StellarWalletsKit)
// ============================================================================
// This module wraps the StellarWalletsKit for use in the app.
// Because the kit uses browser APIs, all usage must be client-side only.

import { NETWORK_CONFIG } from "@/lib/stellar/config";
import { WalletError, WalletErrorType } from "@/types";

let kitInitialized = false;
let StellarWalletsKitModule: any = null;
let UtilsModule: any = null;
let NetworksEnum: any = null;

export async function initWalletKit(): Promise<void> {
  if (kitInitialized) return;

  try {
    StellarWalletsKitModule = await import("@creit.tech/stellar-wallets-kit");
    UtilsModule = await import("@creit.tech/stellar-wallets-kit/modules/utils");

    const { StellarWalletsKit, Networks } = StellarWalletsKitModule;
    const { defaultModules } = UtilsModule;
    NetworksEnum = Networks;

    StellarWalletsKit.init({
      network: NETWORK_CONFIG.network === "public" ? Networks.PUBLIC : Networks.TESTNET,
      selectedWalletId: "freighter",
      modules: defaultModules(),
    });

    kitInitialized = true;
    console.log("[Wallet] StellarWalletsKit initialized");
  } catch (error) {
    console.error("[Wallet] Failed to initialize:", error);
    throw createWalletError(WalletErrorType.NotInstalled, error);
  }
}

/**
 * Open the wallet selection modal and connect.
 * Returns the connected wallet address.
 */
export async function connectWallet(): Promise<string> {
  await initWalletKit();

  if (!StellarWalletsKitModule) {
    throw createWalletError(WalletErrorType.NotInstalled);
  }

  try {
    const { StellarWalletsKit } = StellarWalletsKitModule;

    // authModal replaces old openModal — opens wallet picker AND returns address
    const { address } = await StellarWalletsKit.authModal();

    if (!address) {
      throw new Error("No address returned from wallet");
    }

    console.log("[Wallet] Connected:", address);
    return address;
  } catch (error: unknown) {
    const err = error as Error & { code?: number };
    if (err?.message?.includes("rejected") || err?.code === 4001) {
      throw createWalletError(WalletErrorType.UserRejected, error);
    }
    if (err?.message?.includes("not found") || err?.message?.includes("not installed")) {
      throw createWalletError(WalletErrorType.NotInstalled, error);
    }
    throw createWalletError(WalletErrorType.Unknown, error);
  }
}

/**
 * Disconnect the current wallet.
 */
export async function disconnectWallet(): Promise<void> {
  // The kit doesn't have a formal disconnect; we just clear our state.
  console.log("[Wallet] Disconnected");
}

/**
 * Sign a transaction XDR using the connected wallet.
 */
export async function signTransaction(txXdr: string): Promise<string> {
  await initWalletKit();

  if (!StellarWalletsKitModule) {
    throw createWalletError(WalletErrorType.NotInstalled);
  }

  try {
    const { StellarWalletsKit } = StellarWalletsKitModule;
    const { address } = await StellarWalletsKit.getAddress();

    const { signedTxXdr } = await StellarWalletsKit.signTransaction(txXdr, {
      networkPassphrase: NETWORK_CONFIG.networkPassphrase,
      address,
    });

    return signedTxXdr;
  } catch (error: unknown) {
    const err = error as Error & { code?: number };
    if (err?.message?.includes("rejected") || err?.code === 4001) {
      throw createWalletError(WalletErrorType.UserRejected, error);
    }
    if (err?.message?.includes("insufficient") || err?.message?.includes("balance")) {
      throw createWalletError(WalletErrorType.InsufficientBalance, error);
    }
    throw createWalletError(WalletErrorType.Unknown, error);
  }
}

// ─── Error Helpers ─────────────────────────────────────────────────────────

function createWalletError(
  type: WalletErrorType,
  originalError?: unknown
): WalletError {
  const messages: Record<WalletErrorType, string> = {
    [WalletErrorType.NotInstalled]:
      "No compatible wallet found. Please install Freighter, xBull, or another Stellar wallet extension.",
    [WalletErrorType.UserRejected]:
      "Transaction was rejected. Please approve the transaction in your wallet to continue.",
    [WalletErrorType.InsufficientBalance]:
      "Insufficient XLM balance. Please fund your testnet account using Friendbot.",
    [WalletErrorType.NetworkError]:
      "Network error. Please check your connection and try again.",
    [WalletErrorType.Unknown]:
      "An unexpected wallet error occurred. Please try again.",
  };

  return {
    type,
    message: messages[type],
    originalError,
  };
}

/**
 * Get a user-friendly error message for display
 */
export function getWalletErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "type" in error) {
    return (error as WalletError).message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred.";
}
