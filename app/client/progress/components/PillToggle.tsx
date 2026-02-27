// app/client/progress/components/PillToggle.tsx
"use client";

import React from "react";
import type { RangeKey } from "../types";

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function PillToggle({
  value,
  onChange,
}: {
  value: RangeKey;
  onChange: (v: RangeKey) => void;
}) {
  return (
    <div className="inline-flex items-center rounded-full border border-white/60 bg-white/50 backdrop-blur p-1 shadow-sm">
      <button
        type="button"
        onClick={() => onChange("7")}
        className={cn(
          "rounded-full px-3 py-1.5 text-xs font-semibold transition",
          value === "7"
            ? "bg-indigo-600/90 text-white shadow-sm"
            : "text-gray-700 hover:bg-white/80"
        )}
      >
        7 zile
      </button>
      <button
        type="button"
        onClick={() => onChange("30")}
        className={cn(
          "rounded-full px-3 py-1.5 text-xs font-semibold transition",
          value === "30"
            ? "bg-indigo-600/90 text-white shadow-sm"
            : "text-gray-700 hover:bg-white/80"
        )}
      >
        30 zile
      </button>
    </div>
  );
}