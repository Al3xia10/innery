"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "./utils";

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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-70 flex items-end sm:items-center justify-center p-3 sm:p-6">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/30"
        onClick={onCancel}
      />
      <div
        ref={panelRef}
        className="relative w-full max-w-md rounded-3xl border border-black/5 shadow-xl"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(224,231,255,0.7) 100%)",
        }}
      >
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
              <p className="mt-1 text-sm text-gray-600">{message}</p>
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50 transition"
            >
              Închide
            </button>
          </div>

          <div className="mt-5 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onConfirm}
              className={cn(
                "inline-flex w-full sm:w-auto items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition",
                danger ? "bg-rose-600 text-white hover:bg-rose-700" : "bg-indigo-600 text-white hover:bg-indigo-700"
              )}
            >
              {confirmText}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50 transition"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}