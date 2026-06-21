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
    "bg-[var(--color-success)]/10 text-[var(--color-success)] border-transparent",
  closed:
    "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border-subtle)]",
  ended:
    "bg-[var(--color-accent-orange)]/10 text-[var(--color-accent-orange)] border-transparent",
  // Transaction statuses
  pending:
    "bg-[var(--color-accent-orange)]/10 text-[var(--color-accent-orange)] border-transparent",
  success:
    "bg-[var(--color-success)]/10 text-[var(--color-success)] border-transparent",
  failed:
    "bg-[var(--color-accent-pink)]/10 text-[var(--color-accent-pink)] border-transparent",
};

export function StatusBadge({ status, className, pulse }: StatusBadgeProps) {
  const style = statusStyles[status] || statusStyles.active;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium border",
        style,
        className
      )}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span
            className={cn(
              "relative inline-flex rounded-full h-1.5 w-1.5 m-auto",
              status === "active" || status === "success"
                ? "bg-[var(--color-success)]"
                : status === "pending"
                ? "bg-[var(--color-accent-orange)]"
                : "bg-[var(--color-accent-pink)]"
            )}
          />
        </span>
      )}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
