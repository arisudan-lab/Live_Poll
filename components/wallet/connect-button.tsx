// ============================================================================
// Wallet Connect Button
// ============================================================================

"use client";

import { useWallet } from "@/hooks/use-wallet";
import { truncateAddress } from "@/lib/stellar/config";
import { getWalletErrorMessage } from "@/lib/wallet/stellar-wallets";
import { Wallet, LogOut, ChevronDown, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

export function ConnectButton() {
  const { address, isConnected, isConnecting, balance, connect, disconnect } =
    useWallet();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleConnect = async () => {
    try {
      await connect();
      toast.success("Wallet connected successfully!");
    } catch (error) {
      const message = getWalletErrorMessage(error);
      toast.error(message);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setMenuOpen(false);
    toast.info("Wallet disconnected");
  };

  if (isConnecting) {
    return (
      <button
        disabled
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] border border-white/[0.08] text-sm text-zinc-400 cursor-wait"
      >
        <Loader2 className="w-4 h-4 animate-spin" />
        Connecting...
      </button>
    );
  }

  if (isConnected && address) {
    return (
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-sm text-white transition-all duration-200"
        >
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500" />
          <span className="hidden sm:inline font-mono text-xs">
            {truncateAddress(address, 4)}
          </span>
          {balance && (
            <span className="hidden lg:inline text-zinc-400 text-xs">
              {balance} XLM
            </span>
          )}
          <ChevronDown className="w-3 h-3 text-zinc-400" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-56 rounded-xl bg-zinc-900 border border-white/[0.08] shadow-2xl shadow-black/50 overflow-hidden z-50">
            <div className="px-4 py-3 border-b border-white/[0.06]">
              <p className="text-xs text-zinc-500">Connected Wallet</p>
              <p className="text-sm font-mono text-white mt-0.5">
                {truncateAddress(address, 6)}
              </p>
              {balance && (
                <p className="text-xs text-zinc-400 mt-1">{balance} XLM</p>
              )}
            </div>
            <button
              onClick={handleDisconnect}
              className="flex items-center gap-2 w-full px-4 py-3 text-sm text-red-400 hover:bg-white/[0.04] transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Disconnect
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-sm font-medium text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
    >
      <Wallet className="w-4 h-4" />
      Connect Wallet
    </button>
  );
}
