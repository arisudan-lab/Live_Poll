// ============================================================================
// Footer Component
// ============================================================================

import { Vote, ExternalLink } from "lucide-react";
import { NETWORK_CONFIG } from "@/lib/stellar/config";

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border-subtle)] bg-[var(--color-bg)] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[var(--color-text-secondary)] text-sm">
            <Vote className="w-4 h-4" />
            <span>LivePoll — Decentralized Polling on Stellar</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--color-success)]/10 text-[var(--color-success)] border border-[var(--color-success)]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)]" />
              {NETWORK_CONFIG.network.charAt(0).toUpperCase() +
                NETWORK_CONFIG.network.slice(1)}
            </span>
            <a
              href="https://stellar.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors text-sm flex items-center gap-1"
            >
              Stellar <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
