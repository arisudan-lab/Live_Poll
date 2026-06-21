// ============================================================================
// Footer Component
// ============================================================================

import { Vote, ExternalLink } from "lucide-react";
import { NETWORK_CONFIG } from "@/lib/stellar/config";

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-zinc-950/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-zinc-500 text-sm">
            <Vote className="w-4 h-4" />
            <span>LivePoll — Decentralized Polling on Stellar</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {NETWORK_CONFIG.network.charAt(0).toUpperCase() +
                NETWORK_CONFIG.network.slice(1)}
            </span>
            <a
              href="https://stellar.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-500 hover:text-zinc-300 transition-colors text-sm flex items-center gap-1"
            >
              Stellar <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
