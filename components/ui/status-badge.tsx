// ============================================================================
// Status Badge Component
// ============================================================================

import { cn } from "@/lib/utils";
import { PollStatus, TransactionStatus } from "@/types";

interface StatusBadgeProps {
  status: PollStatus | TransactionStatus | string;
  className?: string;
  pulse?: boolean;
}

const statusStyles: Record<string, string> = {
  // Poll statuses
  active:
    "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  closed:
    "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  ended:
    "bg-amber-500/10 text-amber-400 border-amber-500/20",
  // Transaction statuses
  pending:
    "bg-amber-500/10 text-amber-400 border-amber-500/20",
  success:
    "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  failed:
    "bg-red-500/10 text-red-400 border-red-500/20",
};

export function StatusBadge({ status, className, pulse }: StatusBadgeProps) {
  const style = statusStyles[status] || statusStyles.active;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border",
        style,
        className
      )}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span
            className={cn(
              "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
              status === "active" || status === "success"
                ? "bg-emerald-400"
                : status === "pending"
                ? "bg-amber-400"
                : "bg-red-400"
            )}
          />
          <span
            className={cn(
              "relative inline-flex rounded-full h-2 w-2",
              status === "active" || status === "success"
                ? "bg-emerald-400"
                : status === "pending"
                ? "bg-amber-400"
                : "bg-red-400"
            )}
          />
        </span>
      )}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
