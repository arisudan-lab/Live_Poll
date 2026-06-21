// ============================================================================
// Create Poll Dialog Component
// ============================================================================

"use client";

import { useState } from "react";
import { useCreatePoll } from "@/hooks/use-polls";
import { useWalletStore } from "@/stores/wallet-store";
import { Plus, X, Trash2, Loader2, Vote } from "lucide-react";

interface CreatePollDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreatePollDialog({ open, onClose }: CreatePollDialogProps) {
  const { isConnected } = useWalletStore();
  const createPoll = useCreatePoll();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [hasEndTime, setHasEndTime] = useState(false);
  const [endTimeStr, setEndTimeStr] = useState("");

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, ""]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) return;

    const validOptions = options.filter((o) => o.trim());
    if (validOptions.length < 2) return;

    const endTime = hasEndTime && endTimeStr
      ? Math.floor(new Date(endTimeStr).getTime() / 1000)
      : 0;

    try {
      await createPoll.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        options: validOptions,
        endTime,
      });

      // Reset form
      setTitle("");
      setDescription("");
      setOptions(["", ""]);
      setHasEndTime(false);
      setEndTimeStr("");
      onClose();
    } catch {
      // Error handled by mutation
    }
  };

  if (!open) return null;

  const isValid =
    title.trim() &&
    options.filter((o) => o.trim()).length >= 2 &&
    isConnected;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-[var(--color-bg)] border border-[var(--color-border-subtle)] shadow-sm">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 pb-4 bg-[var(--color-bg)]/95 backdrop-blur-sm border-b border-[var(--color-border-subtle)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)] flex items-center justify-center">
              <Vote className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                Create Poll
              </h2>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Create a new on-chain poll
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
              Poll Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's your question?"
              maxLength={100}
              className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]/30 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more context (optional)"
              rows={3}
              maxLength={500}
              className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]/30 transition-all resize-none"
            />
          </div>

          {/* Options */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
              Options * (min 2)
            </label>
            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[var(--color-surface)] border border-[var(--color-border-subtle)] flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-[var(--color-text-secondary)]">{index + 1}</span>
                  </div>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    maxLength={100}
                    className="flex-1 px-3 py-2.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] text-sm focus:outline-none focus:border-[var(--color-primary)] transition-all"
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="p-2 rounded-lg hover:bg-[var(--color-accent-pink)]/10 text-[var(--color-text-secondary)] hover:text-[var(--color-accent-pink)] transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {options.length < 10 && (
              <button
                type="button"
                onClick={addOption}
                className="mt-2 flex items-center gap-2 text-sm text-[var(--color-primary)] hover:brightness-110 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Option
              </button>
            )}
          </div>

          {/* End Time */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasEndTime}
                onChange={(e) => setHasEndTime(e.target.checked)}
                className="rounded border-[var(--color-border-subtle)] bg-[var(--color-surface)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]/30"
              />
              <span className="text-sm text-[var(--color-text-primary)]">Set end time</span>
            </label>
            {hasEndTime && (
              <input
                type="datetime-local"
                value={endTimeStr}
                onChange={(e) => setEndTimeStr(e.target.value)}
                className="mt-2 w-full px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:border-[var(--color-primary)] transition-all [color-scheme:dark]"
              />
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!isValid || createPoll.isPending}
            className="w-full py-3 rounded-xl bg-[var(--color-primary)] hover:brightness-110 disabled:opacity-50 disabled:hover:brightness-100 disabled:cursor-not-allowed text-[var(--color-text-primary)] font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2"
          >
            {createPoll.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Create Poll
              </>
            )}
          </button>

          {!isConnected && (
            <p className="text-center text-xs text-[var(--color-accent-orange)]">
              Please connect your wallet to create a poll
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
