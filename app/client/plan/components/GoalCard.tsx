"use client";

import * as React from "react";
import type { Goal } from "../lib/goalTypes";
import { cn, toNiceDate } from "../lib/goalTypes";

export default function GoalCard({
  goal,
  tone,
  onEdit,
  onDelete,
}: {
  goal: Goal;
  tone: "active" | "paused" | "done";
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const progress = typeof goal.progress === "number" ? goal.progress : 0;

  const accent =
    tone === "active"
      ? "from-indigo-500/60 to-pink-500/40"
      : tone === "paused"
        ? "from-gray-400/50 to-gray-200/30"
        : "from-emerald-500/45 to-emerald-200/20";

  const badge =
    goal.status === "Activ"
      ? "bg-indigo-50 text-indigo-800 ring-1 ring-indigo-100"
      : goal.status === "În pauză"
        ? "bg-gray-100 text-gray-800 ring-1 ring-gray-200"
        : "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/70 p-4 shadow-sm">
      <div className={cn("absolute left-0 top-0 h-full w-1.5 bg-linear-to-b", accent)} aria-hidden="true" />

      <div className="pl-2.5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{goal.title}</p>
          {goal.subtitle ? <p className="mt-0.5 text-sm text-gray-600 truncate">{goal.subtitle}</p> : null}
          <p className="mt-2 text-xs text-gray-500">Actualizat {toNiceDate(goal.updatedAt)}</p>
        </div>

        <div className="shrink-0 flex flex-col items-end gap-2">
          <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", badge)}>
            {goal.status}
          </span>

          <div className="w-28">
            <div className="h-2 rounded-full bg-white/60 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(100, Math.max(0, progress))}%`,
                  background:
                    tone === "done"
                      ? "linear-gradient(90deg, rgba(16,185,129,0.65), rgba(16,185,129,0.25))"
                      : "linear-gradient(90deg, rgba(99,102,241,0.70), rgba(236,72,153,0.35))",
                }}
              />
            </div>
            <p className="mt-1 text-[11px] text-gray-500 text-right tabular-nums">{progress}%</p>
          </div>

          <div className="mt-1 flex items-center gap-2">
            {onEdit ? (
              <button
                type="button"
                onClick={onEdit}
                className="text-xs font-semibold text-indigo-700 hover:text-indigo-800 transition"
              >
                Editează
              </button>
            ) : null}

            {onDelete ? (
              <button
                type="button"
                onClick={onDelete}
                className="inline-flex items-center justify-center rounded-lg border border-white/60 bg-white/70 px-2 py-1 text-xs font-semibold text-gray-800 shadow-sm hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition"
                aria-label="Șterge"
                title="Șterge"
              >
                🗑️
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}