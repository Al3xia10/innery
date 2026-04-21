"use client";

import * as React from "react";
import type { Goal } from "../lib/goalTypes";
import { cn } from "../lib/goalTypes";
import StepList from "./StepList";

export default function GoalCard({
  goal,
  tone,
  onEdit,
  onDelete,
  onToggleStep,
}: {
  goal: Goal;
  tone: "active" | "paused" | "done";
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleStep?: (stepId: string, nextDone: boolean) => void;
}) {
  const progress = typeof goal.progress === "number" ? goal.progress : 0;
  const stepsCount = Array.isArray(goal.steps) ? goal.steps.length : 0;
  const doneCount = Array.isArray(goal.steps) ? goal.steps.filter((s) => s.done).length : 0;
  const [showSteps, setShowSteps] = React.useState(true);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const key = `goal_steps_visible_${goal.id}`;
    const raw = window.localStorage.getItem(key);
    if (raw === "0") setShowSteps(false);
    if (raw === "1") setShowSteps(true);
  }, [goal.id]);

  function toggleStepsVisibility() {
    setShowSteps((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        const key = `goal_steps_visible_${goal.id}`;
        window.localStorage.setItem(key, next ? "1" : "0");
      }
      return next;
    });
  }

  const accent =
    tone === "active"
      ? "before:absolute before:left-5 before:right-5 before:top-0 before:h-px before:bg-[linear-gradient(90deg,rgba(239,208,202,0.8),transparent)] before:content-['']"
      : tone === "paused"
        ? "before:absolute before:left-5 before:right-5 before:top-0 before:h-px before:bg-[linear-gradient(90deg,rgba(125,128,218,0.75),transparent)] before:content-['']"
        : "before:absolute before:left-5 before:right-5 before:top-0 before:h-px before:bg-[linear-gradient(90deg,rgba(16,185,129,0.7),transparent)] before:content-['']";

  const badge =
    goal.status === "Activ"
      ? "border-[#ead7df] bg-[#fff9fb] text-[#7d5d6c]"
      : goal.status === "În pauză"
        ? "border-[#dcdcf8] bg-[#f5f4ff] text-[#676cc8]"
        : "border-[#cdeee2] bg-[#f3fbf7] text-[#2f7a63]";

  return (
    <div
      className={cn(
        "relative self-start h-fit overflow-hidden rounded-[28px] border border-black/5 p-4 shadow-[0_12px_30px_rgba(31,23,32,0.06)] transition-all duration-250 sm:rounded-4xl sm:px-5 sm:py-4.5",
        accent
      )}
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(252,249,251,0.98) 100%)",
      }}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-5">
        <div className="min-w-0 flex-1 pr-2">
          <p className="text-[1.08rem] font-semibold tracking-tight text-foreground sm:truncate">{goal.title}</p>
          {goal.subtitle ? (
            <p className="mt-1 line-clamp-2 text-[15px] leading-6 sm:leading-7 text-(--color-foreground-muted,#6B5A63)">{goal.subtitle}</p>
          ) : null}
        </div>

        <div className="flex w-full shrink-0 flex-col gap-2 sm:w-31 sm:items-end">
          <span className={cn("inline-flex self-start items-center rounded-[18px] border px-2.5 py-1 text-[9px] font-semibold tracking-[0.12em] uppercase shadow-[0_3px_8px_rgba(31,23,32,0.04)] sm:self-auto", badge)}>
            {goal.status}
          </span>

          <div className="w-full pt-0.5">
            <div className="flex items-center justify-between gap-2">
              <div className="h-2.5 flex-1 rounded-full bg-black/5 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(100, Math.max(0, progress))}%`,
                    background:
                      tone === "done"
                        ? "linear-gradient(90deg, rgba(16,185,129,0.75), rgba(16,185,129,0.35))"
                        : "linear-gradient(90deg, rgba(239,208,202,0.9), rgba(125,128,218,0.45))",
                  }}
                />
              </div>
              <p className="text-[11px] font-medium text-(--color-foreground-muted,#6B5A63) tabular-nums">
                {progress}%
              </p>
            </div>
          </div>
        </div>
      </div>
      {stepsCount > 0 ? (
        <div className="mt-4">
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <button
              type="button"
              onClick={toggleStepsVisibility}
              className="inline-flex min-h-10 w-full sm:w-auto items-center justify-center gap-2 rounded-[18px] border border-black/5 bg-white px-3 py-2 text-[11px] font-semibold text-(--color-foreground-muted,#6B5A63) shadow-[0_4px_10px_rgba(31,23,32,0.04)] transition hover:bg-black/5 hover:text-foreground"
            >
              {showSteps ? "Ascunde pașii" : "Arată pașii"}
            </button>
            <span className="text-[11px] font-medium text-(--color-foreground-muted,#6B5A63)">
              {doneCount}/{stepsCount} completați
            </span>
          </div>

          <div
            className={cn(
              "transition-all duration-250 ease-out",
              showSteps
                ? "mt-2 max-h-135 opacity-100"
                : "pointer-events-none max-h-0 opacity-0"
            )}
          >
            <StepList steps={goal.steps ?? []} onToggle={onToggleStep} />
          </div>
        </div>
      ) : null}

      {(onEdit || onDelete) ? (
        <>
          <div className="mt-4 h-px w-full bg-[linear-gradient(90deg,rgba(31,23,32,0.08),transparent)]" />
          <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:items-center">
            {onEdit ? (
              <button
                type="button"
                onClick={onEdit}
                className="inline-flex min-h-10 w-full sm:w-auto items-center justify-center rounded-[18px] border border-black/5 bg-white px-3 py-2 text-[11px] font-semibold text-(--color-foreground-muted,#6B5A63) shadow-[0_4px_10px_rgba(31,23,32,0.04)] transition hover:bg-black/5 hover:text-foreground"
              >
                Editează
              </button>
            ) : null}

            {onDelete ? (
              <button
                type="button"
                onClick={onDelete}
                className="inline-flex min-h-10 w-full sm:w-auto items-center justify-center rounded-[18px] border border-black/5 bg-white px-3 py-2 text-[11px] font-semibold text-[#8A7B83] shadow-[0_4px_10px_rgba(31,23,32,0.04)] transition hover:bg-black/5 hover:text-foreground"
                aria-label="Sterge"
                title="Sterge"
              >
                Șterge
              </button>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}
