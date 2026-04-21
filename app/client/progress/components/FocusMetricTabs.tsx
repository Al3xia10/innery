"use client";

import React from "react";
import type { FocusMetric } from "../types";

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function FocusMetricTabs({
  value,
  onChange,
}: {
  value: FocusMetric;
  onChange: (v: FocusMetric) => void;
}) {
  return (
    <div className="max-w-full overflow-x-auto px-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-0">
      <div className="inline-flex items-center gap-1 rounded-[20px] border border-(--color-soft) bg-background p-1 shadow-[0_6px_14px_rgba(31,23,32,0.06)] sm:rounded-full">
        <button
          type="button"
          onClick={() => onChange("mood")}
          className={cn(
            "rounded-[18px] px-3.5 py-2 text-[12px] font-semibold transition sm:rounded-full",
            value === "mood" ? "bg-(--color-accent) text-white shadow-[0_8px_18px_rgba(239,135,192,0.22)]" : "text-foreground bg-transparent hover:bg-(--color-card)"
          )}
        >
          Stare
        </button>
        <button
          type="button"
          onClick={() => onChange("anxiety")}
          className={cn(
            "rounded-[18px] px-3.5 py-2 text-[12px] font-semibold transition sm:rounded-full",
            value === "anxiety" ? "bg-(--color-accent) text-white shadow-[0_8px_18px_rgba(239,135,192,0.22)]" : "text-foreground bg-transparent hover:bg-(--color-card)"
          )}
        >
          Tensiune
        </button>
        <button
          type="button"
          onClick={() => onChange("energy")}
          className={cn(
            "rounded-[18px] px-3.5 py-2 text-[12px] font-semibold transition sm:rounded-full",
            value === "energy" ? "bg-(--color-accent) text-white shadow-[0_8px_18px_rgba(239,135,192,0.22)]" : "text-foreground bg-transparent hover:bg-(--color-card)"
          )}
        >
          Energie
        </button>
        <button
          type="button"
          onClick={() => onChange("sleep")}
          className={cn(
            "rounded-[18px] px-3.5 py-2 text-[12px] font-semibold transition sm:rounded-full",
            value === "sleep" ? "bg-(--color-accent) text-white shadow-[0_8px_18px_rgba(239,135,192,0.22)]" : "text-foreground bg-transparent hover:bg-(--color-card)"
          )}
        >
          Somn
        </button>
      </div>
    </div>
  );
}