"use client";

import React from "react";
import { cn } from "./utils";

export default function Toast({
  kind,
  message,
  onClose,
}: {
  kind: "error" | "success" | "info";
  message: string;
  onClose: () => void;
}) {
  return (
    <div
      role="status"
      className={cn(
        "fixed right-4 top-4 z-90 w-[min(92vw,380px)] rounded-2xl border border-black/5 bg-white shadow-lg p-4",
        kind === "error"
          ? "border-rose-200"
          : kind === "success"
            ? "border-emerald-200"
            : "border-indigo-200"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "mt-0.5 h-2.5 w-2.5 rounded-full",
            kind === "error"
              ? "bg-rose-500"
              : kind === "success"
                ? "bg-emerald-500"
                : "bg-indigo-500"
          )}
        />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900">
            {kind === "error" ? "Ups" : kind === "success" ? "Gata" : "Info"}
          </p>
          <p className="mt-0.5 text-sm text-gray-600 leading-relaxed">{message}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-xl border border-transparent hover:border-gray-200 hover:bg-gray-50 transition"
          aria-label="Închide"
          title="Închide"
        >
          <span className="text-gray-500">✕</span>
        </button>
      </div>
    </div>
  );
}