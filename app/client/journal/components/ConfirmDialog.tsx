"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "./utils";
import { createPortal } from "react-dom";

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmText,
  cancelText,
  danger,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  useEffect(() => {
    if (!open) return;
    const first = panelRef.current?.querySelector<HTMLButtonElement>("button");
    first?.focus();
  }, [open]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-200 flex items-end justify-center p-3 sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-[rgba(31,23,32,0.38)] backdrop-blur-[3px]"
        onClick={onCancel}
      />
      <div
        ref={panelRef}
        className="relative w-full max-w-md rounded-[28px] border border-black/5 shadow-[0_24px_70px_rgba(31,23,32,0.22)]"
        style={{
          background:
            "linear-gradient(135deg, #ffffff 0%, rgba(239,208,202,0.18) 60%, rgba(125,128,218,0.08) 100%)",
        }}
      >
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-foreground">{title}</h2>
              <p className="mt-1 text-sm leading-7 text-(--color-foreground-muted,#6B5A63)">{message}</p>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={onConfirm}
              className={cn(
                "inline-flex w-full sm:w-auto items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition",
                danger
                  ? "bg-rose-500 text-white shadow-[0_10px_20px_rgba(244,63,94,0.25)] hover:bg-rose-600"
                  : "bg-(--color-primary) text-white shadow-[0_10px_20px_rgba(125,128,218,0.25)] hover:opacity-95"
              )}
            >
              {confirmText}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl border border-black/5 bg-white/80 px-4 py-2.5 text-sm font-semibold text-foreground shadow-[0_4px_10px_rgba(31,23,32,0.05)] transition hover:bg-(--color-soft)"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}