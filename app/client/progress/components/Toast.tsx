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
        "fixed left-1/2 -translate-x-1/2 bottom-4 sm:left-auto sm:translate-x-0 sm:right-4 sm:top-4 sm:bottom-auto z-50 w-[min(92vw,380px)] rounded-[18px] sm:rounded-[22px] border border-black/5 bg-white shadow-lg p-3 sm:p-4",
        kind === "error" ? "border-rose-200" : "border-emerald-200"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "mt-0.5 h-2 w-2 rounded-full",
            kind === "error" ? "bg-rose-500" : "bg-emerald-500"
          )}
        />
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-tight text-gray-900">
            {kind === "error" ? "Ups" : "Gata"}
          </p>
          <p className="mt-0.5 text-sm text-gray-600 leading-6 sm:leading-relaxed">{message}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-[14px] border border-transparent hover:border-gray-200 hover:bg-gray-50 transition"
          aria-label="Închide"
          title="Închide"
        >
          <span className="text-gray-500">✕</span>
        </button>
      </div>
    </div>
  );
}