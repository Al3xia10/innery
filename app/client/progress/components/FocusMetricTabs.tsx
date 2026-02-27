// app/client/progress/components/FocusMetricTabs.tsx
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
      <div className="inline-flex items-center gap-1 rounded-full border border-white/60 bg-white/50 backdrop-blur p-1 shadow-sm">
        <button
          type="button"
          onClick={() => onChange("mood")}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-semibold transition",
            value === "mood" ? "bg-indigo-600/90 text-white shadow-sm" : "text-gray-700 hover:bg-white/80"
          )}
        >
          Stare
        </button>
        <button
          type="button"
          onClick={() => onChange("anxiety")}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-semibold transition",
            value === "anxiety" ? "bg-indigo-600/90 text-white shadow-sm" : "text-gray-700 hover:bg-white/80"
          )}
        >
          Tensiune
        </button>
        <button
          type="button"
          onClick={() => onChange("energy")}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-semibold transition",
            value === "energy" ? "bg-indigo-600/90 text-white shadow-sm" : "text-gray-700 hover:bg-white/80"
          )}
        >
          Energie
        </button>
        <button
          type="button"
          onClick={() => onChange("sleep")}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-semibold transition",
            value === "sleep" ? "bg-indigo-600/90 text-white shadow-sm" : "text-gray-700 hover:bg-white/80"
          )}
        >
          Somn
        </button>
      </div>
    </div>
  );
}