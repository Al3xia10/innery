"use client";


import Link from "next/link";
import { cn } from "../lib/goalTypes";

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-black/5 bg-white px-3 py-2 shadow-[0_4px_10px_rgba(31,23,32,0.05)]">
      <p className="text-[11px] leading-5 text-(--color-foreground-muted,#6B5A63)">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-foreground tabular-nums">{value}</p>
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
        className="overflow-hidden rounded-[28px] border border-black/5 shadow-[0_10px_28px_rgba(31,23,32,0.05)] sm:rounded-4xl"
        style={{
          background:
            "linear-gradient(135deg, #ffffff 0%, rgba(239,208,202,0.18) 60%, rgba(125,128,218,0.08) 100%)",
        }}
      >
        <div className="mx-auto max-w-6xl px-4 py-6 space-y-6 sm:px-6 sm:py-8 sm:space-y-8 lg:px-8">
          {/* Top row: chip + title/desc + actions */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              

              <h1 className="mt-2 text-[1.7rem] font-semibold leading-[1.05] tracking-tight text-foreground sm:mt-3 sm:text-[2.55rem]">
              Planul tău
            </h1>
            <p className="mt-2 max-w-2xl text-[15px] leading-6 sm:mt-3 sm:leading-8 text-(--color-foreground-muted,#6B5A63) sm:text-[14px]">
             Obiective, exerciții și resurse — ca să nu cari singur totul între ședințe.
            </p>
            </div>

            <div className="flex flex-col gap-2.5 sm:mt-3 sm:flex-row sm:items-center sm:gap-3">
              <button
                type="button"
                onClick={onAddGoal}
                disabled={addingGoal}
                className={cn(
                  "inline-flex min-h-11 w-full sm:w-auto items-center justify-center rounded-[18px] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(239,135,192,0.18)] transition",
                  addingGoal
                    ? "cursor-not-allowed bg-[rgba(239,135,192,0.28)] text-white/80"
                    : "bg-(--color-accent) hover:opacity-95"
                )}
              >
                {addingGoal ? "Se adaugă…" : "Adaugă obiectiv"}
              </button>

              <Link
                href="/client/journal"
                className="inline-flex min-h-11 w-full sm:w-auto items-center justify-center rounded-[18px] border border-black/5 bg-white px-4 py-2.5 text-sm font-semibold text-foreground shadow-[0_6px_14px_rgba(31,23,32,0.06)] transition hover:bg-[#fffafb]"
              >
                Deschide jurnalul
              </Link>
            </div>
          </div>

          {/* Ritual block */}
          <div className="bg-[linear-gradient(135deg,var(--color-warm)_0%,var(--color-accent)_50%,var(--color-primary)_100%)] rounded-[20px] border border-black/5 shadow-[0_6px_18px_rgba(31,23,32,0.05)] p-4 sm:rounded-[28px] sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0 lg:max-w-[44%]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-foreground-muted, #6B5A63)]">
              Ritm bland
              </p>

                <p className="mt-3 max-w-2xl text-[15px] leading-6 sm:mt-4 sm:leading-8 text-[var(--color-foreground-muted, #6B5A63)]">
                  Alege <span className="font-semibold text-foreground">un pas mic</span> azi, nu zece pași perfecți.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 rounded-[20px] bg-white/60 p-3 sm:grid-cols-3 sm:rounded-[28px] sm:p-4 lg:min-w-112.5">
                <MiniStat label="Obiective active" value={String(activeGoalsCount)} />
                <MiniStat label="Exerciții" value={String(exercisesCount)} />
                <MiniStat label="Progress" value={`${progressSummary}%`} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}