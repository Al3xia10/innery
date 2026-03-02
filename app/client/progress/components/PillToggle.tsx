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
    <div className="inline-flex items-center rounded-full border border-black/5 bg-white p-1 shadow-sm">
      <button
        type="button"
        onClick={() => onChange("7")}
        className={cn(
          "rounded-full px-3 py-1.5 text-xs font-semibold transition",
          value === "7"
            ? "bg-indigo-600 text-white shadow-sm"
            : "text-gray-700 hover:bg-gray-100"
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
            ? "bg-indigo-600 text-white shadow-sm"
            : "text-gray-700 hover:bg-gray-100"
        )}
      >
        30 zile
      </button>
    </div>
  );
}