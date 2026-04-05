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
    <div className="max-w-full overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="inline-flex items-center gap-1 rounded-full border border-(--color-soft) bg-background p-1 shadow-[0_6px_14px_rgba(31,23,32,0.06)]">
        <button
          type="button"
          onClick={() => onChange("mood")}
          className={cn(
            "rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition",
            value === "mood" ? "bg-(--color-accent) text-white shadow-[0_10px_20px_rgba(239,135,192,0.25)]" : "text-foreground bg-transparent hover:bg-(--color-card)"
          )}
        >
          Stare
        </button>
        <button
          type="button"
          onClick={() => onChange("anxiety")}
          className={cn(
            "rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition",
            value === "anxiety" ? "bg-(--color-accent) text-white shadow-[0_10px_20px_rgba(239,135,192,0.25)]" : "text-foreground bg-transparent hover:bg-(--color-card)"
          )}
        >
          Tensiune
        </button>
        <button
          type="button"
          onClick={() => onChange("energy")}
          className={cn(
            "rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition",
            value === "energy" ? "bg-(--color-accent) text-white shadow-[0_10px_20px_rgba(239,135,192,0.25)]" : "text-foreground bg-transparent hover:bg-(--color-card)"
          )}
        >
          Energie
        </button>
        <button
          type="button"
          onClick={() => onChange("sleep")}
          className={cn(
            "rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition",
            value === "sleep" ? "bg-(--color-accent) text-white shadow-[0_10px_20px_rgba(239,135,192,0.25)]" : "text-foreground bg-transparent hover:bg-(--color-card)"
          )}
        >
          Somn
        </button>
      </div>
    </div>
  );
}