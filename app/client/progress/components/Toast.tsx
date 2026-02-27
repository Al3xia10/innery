// app/client/progress/components/Toast.tsx
"use client";

import React from "react";

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function Toast({
  kind,
  message,
  onClose,
}: {
  kind: "error" | "success";
  message: string;
  onClose: () => void;
}) {
  return (
    <div
      role="status"
      className={cn(
        "fixed right-4 top-4 z-50 w-[min(92vw,380px)] rounded-2xl border bg-white/90 backdrop-blur shadow-lg p-4",
        kind === "error" ? "border-rose-200" : "border-emerald-200"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "mt-0.5 h-2.5 w-2.5 rounded-full",
            kind === "error" ? "bg-rose-500" : "bg-emerald-500"
          )}
        />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900">
            {kind === "error" ? "Ups" : "Gata"}
          </p>
          <p className="mt-0.5 text-sm text-gray-600 leading-relaxed">{message}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-xl hover:bg-gray-100 transition"
          aria-label="Închide"
          title="Închide"
        >
          <span className="text-gray-500">✕</span>
        </button>
      </div>
    </div>
  );
}