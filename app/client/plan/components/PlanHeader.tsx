"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "../lib/goalTypes";

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/70 px-3 py-2 shadow-sm">
      <p className="text-[11px] text-gray-600">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-gray-900 tabular-nums">{value}</p>
    </div>
  );
}

export default function PlanHeader({
  activeGoalsCount,
  exercisesCount,
  progressSummary,
  addingGoal,
  onAddGoal,
}: {
  activeGoalsCount: number;
  exercisesCount: number;
  progressSummary: number;
  addingGoal: boolean;
  onAddGoal: () => void;
}) {
  return (
    <header>
      <div
        className="rounded-3xl border border-black/5 shadow-sm overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(224,231,255,0.7) 100%)",
        }}
      >
        <div className="mx-auto max-w-6xl px-6 lg:px-8 py-8 space-y-8">
          {/* Top row: chip + title/desc + actions */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-indigo-700 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                Planul tau 
              </div>

              <h1 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">
                Plan
              </h1>
              <p className="mt-1 text-sm text-gray-600 max-w-2xl">
                Obiective, exerciții și resurse — ca să nu cari singur totul între ședințe.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onAddGoal}
                disabled={addingGoal}
                className={cn(
                  "text-sm font-semibold transition",
                  addingGoal
                    ? "text-indigo-700/60 cursor-not-allowed"
                    : "text-indigo-700 hover:text-indigo-800"
                )}
              >
                {addingGoal ? "Se adaugă…" : "Adaugă"}
              </button>

              <Link
                href="/client/journal"
                className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white/70 px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition"
              >
                Deschide jurnalul
              </Link>
            </div>
          </div>

          {/* Ritual block */}
          <div className="rounded-3xl border border-black/10 bg-white/60 shadow-sm p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900">Ritual mic, efect mare</p>
                <p className="mt-1 text-sm text-gray-600">
                  Alege <span className="font-semibold text-gray-800">un pas mic</span> azi, nu zece pași perfecți.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <MiniStat label="Obiective active" value={String(activeGoalsCount)} />
                <MiniStat label="Exerciții" value={String(exercisesCount)} />
                <MiniStat label="Progres" value={`${progressSummary}%`} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}