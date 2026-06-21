// ============================================================================
// Event Feed Component
// ============================================================================

"use client";

import { ContractEvent, ContractEventType } from "@/types";
import { truncateAddress, formatRelativeTime } from "@/lib/stellar/config";
import { Vote, CheckCircle2, Lock, Activity, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EventFeedProps {
  events: ContractEvent[];
  isPolling: boolean;
}

const eventConfig: Record<
  string,
  { icon: LucideIcon; color: string; bg: string }
> = {
  [ContractEventType.PollCreated]: {
    icon: Vote,
    color: "text-[var(--color-primary)]",
    bg: "bg-[var(--color-primary)]/10 border-transparent",
  },
  [ContractEventType.VoteCast]: {
    icon: CheckCircle2,
    color: "text-[var(--color-success)]",
    bg: "bg-[var(--color-success)]/10 border-transparent",
  },
  [ContractEventType.PollClosed]: {
    icon: Lock,
    color: "text-[var(--color-accent-orange)]",
    bg: "bg-[var(--color-accent-orange)]/10 border-transparent",
  },
};

export function EventFeed({ events, isPolling }: EventFeedProps) {
  return (
    <div className="space-y-3">
      {/* Polling indicator */}
      {isPolling && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border-subtle)] mb-4">
          <span className="relative flex h-2 w-2">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-success)]" />
          </span>
          <span className="text-xs text-[var(--color-text-secondary)]">
            Live — Auto-updating
          </span>
        </div>
      )}

      {events.map((event, index) => (
        <EventItem key={event.id} event={event} index={index} />
      ))}
    </div>
  );
}

function EventItem({ event, index }: { event: ContractEvent; index: number }) {
  const config = eventConfig[event.type] || {
    icon: Activity,
    color: "text-[var(--color-text-secondary)]",
    bg: "bg-[var(--color-surface)] border-[var(--color-border-subtle)]",
  };
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex items-start gap-4 p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] hover:bg-[var(--color-bg)] transition-colors duration-200",
        index === 0 && "animate-in slide-in-from-top-2 duration-300"
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Icon */}
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center border flex-shrink-0",
          config.bg
        )}
      >
        <Icon className={cn("w-5 h-5", config.color)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-[var(--color-text-primary)] capitalize">
            {event.type ? event.type.replace("_", " ") : "Unknown"}
          </span>
          <span className="text-xs text-[var(--color-text-secondary)] opacity-50">•</span>
          <span className="text-xs text-[var(--color-text-secondary)]" suppressHydrationWarning>
            {formatRelativeTime(event.timestamp)}
          </span>
        </div>
        <p className="text-sm text-[var(--color-text-secondary)]">{event.action}</p>
        <p className="text-xs text-[var(--color-text-secondary)] mt-1 font-mono opacity-70">
          {truncateAddress(event.walletAddress, 6)}
        </p>
      </div>

      {/* Ledger */}
      <span className="text-xs text-[var(--color-text-secondary)] font-mono flex-shrink-0 opacity-50">
        #{event.ledger}
      </span>
    </div>
  );
}
