// ============================================================================
// Transaction List Component
// ============================================================================

"use client";

import { TransactionRecord, TransactionStatus, TransactionType } from "@/types";
import { StatusBadge } from "@/components/ui/status-badge";
import { truncateAddress, formatRelativeTime } from "@/lib/stellar/config";
import {
  ExternalLink,
  Vote,
  CheckCircle2,
  Lock,
  Copy,
  LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

interface TransactionListProps {
  transactions: TransactionRecord[];
}

const txTypeConfig: Record<
  string,
  { icon: LucideIcon; label: string }
> = {
  [TransactionType.CreatePoll]: { icon: Vote, label: "Create Poll" },
  [TransactionType.CastVote]: { icon: CheckCircle2, label: "Cast Vote" },
  [TransactionType.ClosePoll]: { icon: Lock, label: "Close Poll" },
};

export function TransactionList({ transactions }: TransactionListProps) {
  return (
    <div className="space-y-2">
      {transactions.map((tx) => (
        <TransactionRow key={tx.hash} transaction={tx} />
      ))}
    </div>
  );
}

function TransactionRow({ transaction: tx }: { transaction: TransactionRecord }) {
  const config = txTypeConfig[tx.type] || { icon: ExternalLink, label: tx.type || "Unknown" };
  const Icon = config.icon;

  const copyHash = () => {
    navigator.clipboard.writeText(tx.hash);
    toast.success("Transaction hash copied!");
  };

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] hover:bg-[var(--color-bg)] transition-colors duration-200">
      {/* Type Icon */}
      <div className="w-10 h-10 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border-subtle)] flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-[var(--color-text-secondary)]" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[var(--color-text-primary)]">
            {config.label}
          </span>
          <StatusBadge
            status={tx.status}
            pulse={false}
          />
        </div>
        <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{tx.description}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-[var(--color-text-secondary)] font-mono opacity-70">
            {truncateAddress(tx.hash, 8)}
          </span>
          <button
            onClick={copyHash}
            className="p-0.5 rounded hover:bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors"
          >
            <Copy className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Time + Link */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="flex items-center gap-4 text-xs text-[var(--color-text-secondary)]">
          <span suppressHydrationWarning>
            {formatRelativeTime(tx.timestamp)}
          </span>
        </div>
        <a
          href={tx.explorerLink}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg hover:bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors"
          title="View on explorer"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
