"use client";

import * as React from "react";
import type { GoalStep } from "../lib/goalTypes";

export default function StepList({
  steps,
  onToggle,
}: {
  steps: GoalStep[];
  onToggle?: (stepId: string, nextDone: boolean) => void;
}) {
  if (!steps.length) return null;

  const doneCount = steps.filter((s) => s.done).length;

  return (
    <div className="rounded-[20px] border border-black/5 bg-white/75 p-3 shadow-[0_6px_14px_rgba(31,23,32,0.04)] sm:rounded-[28px] sm:p-3.5">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-(--color-foreground-muted,#6B5A63)">
          Pași pentru obiectiv
        </p>
        <span className="inline-flex self-start items-center rounded-[18px] border border-black/5 bg-white px-2.5 py-1 text-[11px] font-semibold text-(--color-foreground-muted,#6B5A63) sm:self-auto">
          {doneCount}/{steps.length}
        </span>
      </div>

      <div className="space-y-2">
      {steps.map((step) => (
        <label
          key={step.id}
          className={[
            "group flex items-start gap-2.5 rounded-[18px] border px-3 py-2.5 text-sm shadow-[0_4px_10px_rgba(31,23,32,0.03)] transition",
            step.done
              ? "border-[#cdeee2] bg-[#f3fbf7]"
              : "border-black/5 bg-white/90 hover:bg-white",
          ].join(" ")}
        >
          <input
            type="checkbox"
            checked={Boolean(step.done)}
            onChange={(e) => onToggle?.(step.id, e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-black/20 accent-(--color-accent)"
          />
          <span className={step.done ? "text-[#6B5A63] line-through" : "text-gray-800 leading-6"}>
            {step.title}
          </span>
        </label>
      ))}
      </div>
    </div>
  );
}
