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
    <div className="inline-flex items-center rounded-[20px] border border-(--color-soft) bg-background p-1 shadow-[0_6px_14px_rgba(31,23,32,0.06)] sm:rounded-full">
      <button
        type="button"
        onClick={() => onChange("7")}
        className={cn(
          "rounded-[18px] px-3.5 py-2 text-[12px] font-semibold transition sm:rounded-full",
          value === "7"
            ? "bg-(--color-accent) text-white shadow-[0_8px_18px_rgba(239,135,192,0.22)]"
            : "text-foreground bg-transparent hover:bg-(--color-card)"
        )}
      >
        7 zile
      </button>
      <button
        type="button"
        onClick={() => onChange("30")}
        className={cn(
          "rounded-[18px] px-3.5 py-2 text-[12px] font-semibold transition sm:rounded-full",
          value === "30"
            ? "bg-(--color-accent) text-white shadow-[0_8px_18px_rgba(239,135,192,0.22)]"
            : "text-foreground bg-transparent hover:bg-(--color-card)"
        )}
      >
        30 zile
      </button>
    </div>
  );
}