"use client";

import React, { useEffect, useState } from "react";
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
  const [shown, setShown] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const leaveTimer = window.setTimeout(() => {
      setLeaving(true);
    }, 2600);

    const closeTimer = window.setTimeout(() => {
      onClose();
    }, 3000);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(closeTimer);
    };
  }, [onClose]);

  return (
    <div
      role="status"
      className={cn(
        "fixed left-1/2 -translate-x-1/2 bottom-4 sm:left-auto sm:translate-x-0 sm:right-4 sm:top-4 sm:bottom-auto z-90 w-[min(92vw,380px)] rounded-[18px] sm:rounded-[22px] border border-black/5 bg-white shadow-[0_14px_40px_rgba(31,23,32,0.12)] p-3 sm:p-4 transition-all duration-300 ease-out",
        shown && !leaving
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-3 sm:translate-y-2",
        kind === "error"
          ? "border-rose-200"
          : kind === "success"
            ? "border-emerald-200"
            : "border-(--color-soft)"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "mt-0.5 h-2 w-2 rounded-full",
            kind === "error"
              ? "bg-rose-500"
              : kind === "success"
                ? "bg-emerald-500"
                : "bg-(--color-primary)"
          )}
        />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground leading-tight">
            {kind === "error" ? "Ups" : kind === "success" ? "Gata" : "Info"}
          </p>
          <p className="mt-0.5 text-sm text-(--color-foreground-muted,#6B5A63) leading-6 sm:leading-relaxed">{message}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-[14px] border border-transparent hover:border-black/5 hover:bg-(--color-soft) transition"
          aria-label="Închide"
          title="Închide"
        >
          <span className="text-[#6B5A63]">✕</span>
        </button>
      </div>
    </div>
  );
}