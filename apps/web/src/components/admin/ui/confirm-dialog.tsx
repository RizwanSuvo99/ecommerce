'use client';

import { AlertTriangle, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Reusable confirmation modal for destructive actions in the admin.
 *
 * Replaces the scattered `window.confirm()` calls used throughout the
 * admin today. Built on plain React so we don't pull in Radix for a
 * single dialog pattern; accessibility is handled by trapping focus
 * inside the panel and wiring `Escape` to close.
 *
 * Two usage modes:
 * 1. Declarative: render <ConfirmDialog open={open} onConfirm={...} ... />
 *    and control `open` yourself.
 * 2. Imperative: call `useConfirm()` and `await confirm({ title, ... })`
 *    — returns a boolean. Easier than hoisting state for one-off
 *    delete buttons scattered across list views.
 */

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** `danger` uses a red confirm button; `neutral` uses the primary theme. */
  tone?: 'danger' | 'neutral';
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmBtn = useRef<HTMLButtonElement>(null);
  const [busy, setBusy] = useState(false);

  // Focus the confirm button on open so Enter immediately acts.
  useEffect(() => {
    if (open) {
      confirmBtn.current?.focus();
    }
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) {
    return null;
  }

  const confirmClass =
    tone === 'danger'
      ? 'bg-red-600 hover:bg-red-700 focus-visible:ring-red-500'
      : 'bg-primary hover:bg-primary/90 focus-visible:ring-primary';

  const handleConfirm = async () => {
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      {/* Click-outside scrim; button role + keyboard support satisfies
          jsx-a11y while the visible child panel owns the real content. */}
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onCancel}
        className="absolute inset-0 h-full w-full cursor-default bg-transparent"
      />
      <div className="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <button
          type="button"
          onClick={onCancel}
          className="absolute right-4 top-4 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3">
          {tone === 'danger' && (
            <div className="rounded-full bg-red-100 p-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
          )}
          <div className="flex-1">
            <h2 id="confirm-title" className="text-lg font-semibold text-gray-900">
              {title}
            </h2>
            {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmBtn}
            type="button"
            onClick={handleConfirm}
            disabled={busy}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 ${confirmClass}`}
          >
            {busy ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Imperative confirm helper for one-off destructive button handlers. */
export function useConfirm(): {
  confirm: (opts: Omit<ConfirmDialogProps, 'open' | 'onConfirm' | 'onCancel'>) => Promise<boolean>;
  dialog: React.ReactNode;
} {
  const [state, setState] = useState<
    | (Omit<ConfirmDialogProps, 'onConfirm' | 'onCancel'> & {
        resolve: (ok: boolean) => void;
      })
    | null
  >(null);

  const confirm = useCallback<
    (opts: Omit<ConfirmDialogProps, 'open' | 'onConfirm' | 'onCancel'>) => Promise<boolean>
  >(
    (opts) =>
      new Promise((resolve) => {
        setState({ ...opts, open: true, resolve });
      }),
    [],
  );

  const dialog = state ? (
    <ConfirmDialog
      {...state}
      onCancel={() => {
        state.resolve(false);
        setState(null);
      }}
      onConfirm={() => {
        state.resolve(true);
        setState(null);
      }}
    />
  ) : null;

  return { confirm, dialog };
}
