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
    <div className="inline-flex items-center rounded-full border border-(--color-soft) bg-background p-1 shadow-[0_6px_14px_rgba(31,23,32,0.06)]">
      <button
        type="button"
        onClick={() => onChange("7")}
        className={cn(
          "rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition",
          value === "7"
            ? "bg-(--color-accent) text-white shadow-[0_10px_20px_rgba(239,135,192,0.25)]"
            : "text-foreground bg-transparent hover:bg-(--color-card)"
        )}
      >
        7 zile
      </button>
      <button
        type="button"
        onClick={() => onChange("30")}
        className={cn(
          "rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition",
          value === "30"
            ? "bg-(--color-accent) text-white shadow-[0_10px_20px_rgba(239,135,192,0.25)]"
            : "text-foreground bg-transparent hover:bg-(--color-card)"
        )}
      >
        30 zile
      </button>
    </div>
  );
}