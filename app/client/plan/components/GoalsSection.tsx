"use client";

import * as React from "react";
import type { Goal } from "../lib/goalTypes";
import { cn } from "../lib/goalTypes";
import GoalCard from "./GoalCard";

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-[28px] border border-black/5 p-4 shadow-sm sm:rounded-4xl sm:p-7"
      style={{
        background:
          "linear-gradient(135deg, #ffffff 0%, rgba(239,208,202,0.18) 60%, rgba(125,128,218,0.08) 100%)",
      }}
    >
      {children}
    </div>
  );
}

function CardHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div className="min-w-0">
        <p className="text-[1rem] font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-[13px] leading-6 text-(--color-foreground-muted,#6B5A63)">{subtitle}</p>
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}

function EmptyState({
  title,
  subtitle,
  cta,
  onClick,
}: {
  title: string;
  subtitle: string;
  cta: string;
  onClick: () => void;
}) {
  return (
    <div
      className="mt-5 rounded-[20px] border border-black/5 bg-white/80 p-5 text-center shadow-[0_6px_14px_rgba(31,23,32,0.05)] sm:rounded-[28px] sm:p-8"
    >
      <p className="text-sm font-semibold text-gray-900">{title}</p>
      <p className="mt-1 text-sm leading-6 sm:leading-7 text-gray-600">{subtitle}</p>
      <button
        type="button"
        onClick={onClick}
        className="mt-4 inline-flex min-h-11 w-full sm:w-auto items-center justify-center rounded-[18px] bg-(--color-accent) px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(239,135,192,0.18)] transition hover:opacity-95"
      >
        {cta}
      </button>
    </div>
  );
}

export default function GoalsSection({
  loading,
  goals,
  activeGoals,
  pausedGoals,
  doneGoals,
  addingGoal,
  onAdd,
  onEdit,
  onDelete,
  onToggleStep,
}: {
  loading: boolean;
  goals: Goal[];
  activeGoals: Goal[];
  pausedGoals: Goal[];
  doneGoals: Goal[];
  addingGoal: boolean;
  onAdd: () => void;
  onEdit: (g: Goal) => void;
  onDelete: (id: string) => void;
  onToggleStep: (goalId: string, stepId: string, nextDone: boolean) => void;
}) {
  return (
    <Card>
      <CardHeader
        title="Obiective"
        subtitle="Ce construiești în perioada asta."
        right={
          <button
            type="button"
            onClick={onAdd}
            disabled={addingGoal}
            className={cn(
              "inline-flex min-h-11 w-full sm:w-auto items-center justify-center rounded-[18px] px-4 py-2.5 text-sm font-semibold transition",
              addingGoal
                ? "bg-(--color-accent)/60 text-white cursor-not-allowed"
                : "bg-(--color-accent) text-white shadow-[0_8px_18px_rgba(239,135,192,0.18)] hover:opacity-95"
            )}
          >
            {addingGoal ? "Se adaugă…" : "Adaugă obiectiv"}
          </button>
        }
      />

      {loading ? (
        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-[20px] border border-black/5 p-4 shadow-[0_6px_14px_rgba(31,23,32,0.05)] sm:rounded-[28px]"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(224,231,255,0.7) 100%)",
              }}
            >
              <div className="h-4 w-1/3 rounded bg-gray-200/70" />
              <div className="mt-2 h-3 w-1/2 rounded bg-gray-200/50" />
              <div className="mt-4 h-2 w-full rounded bg-gray-200/60" />
            </div>
          ))}
        </div>
      ) : goals.length === 0 ? (
        <EmptyState
          title="Încă nu ai obiective"
          subtitle="Un obiectiv bun e scurt, uman și realist."
          cta="Adaugă primul obiectiv"
          onClick={onAdd}
        />
      ) : (
        <div className="mt-5 space-y-6">
          {activeGoals.length ? (
            <section className="space-y-3">
              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-(--color-foreground-muted,#6B5A63)">
                    În lucru acum
                  </p>
                  <p className="mt-1 text-sm text-(--color-foreground-muted,#6B5A63)">
                    Ce construiești în perioada asta.
                  </p>
                </div>
                <span className="mt-1 inline-flex self-start items-center rounded-[18px] border border-black/5 bg-white px-2.5 py-1 text-[11px] font-semibold text-(--color-foreground-muted,#6B5A63) shadow-[0_4px_10px_rgba(31,23,32,0.04)] sm:self-auto">
                  {activeGoals.length}
                </span>
              </div>

              <div className="grid items-start gap-4 xl:grid-cols-2">
                {activeGoals.map((g) => (
                  <GoalCard
                    key={g.id}
                    goal={g}
                    tone="active"
                    onEdit={() => onEdit(g)}
                    onDelete={() => onDelete(g.id)}
                    onToggleStep={(stepId, nextDone) => onToggleStep(g.id, stepId, nextDone)}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {(pausedGoals.length || doneGoals.length) ? (
            <div className="grid items-start gap-4 xl:grid-cols-2">
              {pausedGoals.length ? (
                <section className="space-y-3">
                  <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-(--color-foreground-muted,#6B5A63)">
                        În pauză
                      </p>
                      <p className="mt-1 text-sm text-(--color-foreground-muted,#6B5A63)">
                        Lucruri la care poți reveni când simți.
                      </p>
                    </div>
                    <span className="mt-1 inline-flex self-start items-center rounded-[18px] border border-black/5 bg-white px-2.5 py-1 text-[11px] font-semibold text-(--color-foreground-muted,#6B5A63) shadow-[0_4px_10px_rgba(31,23,32,0.04)] sm:self-auto">
                      {pausedGoals.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {pausedGoals.map((g) => (
                      <GoalCard
                        key={g.id}
                        goal={g}
                        tone="paused"
                        onEdit={() => onEdit(g)}
                        onDelete={() => onDelete(g.id)}
                        onToggleStep={(stepId, nextDone) => onToggleStep(g.id, stepId, nextDone)}
                      />
                    ))}
                  </div>
                </section>
              ) : null}

              {doneGoals.length ? (
                <section className="space-y-3">
                  <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0_12em] text-(--color-foreground-muted,#6B5A63)">
                        Încheiate
                      </p>
                      <p className="mt-1 text-sm text-(--color-foreground-muted,#6B5A63)">
                        Ce ai dus deja până la capăt.
                      </p>
                    </div>
                    <span className="mt-1 inline-flex self-start items-center rounded-[18px] border border-black/5 bg-white px-2.5 py-1 text-[11px] font-semibold text-(--color-foreground-muted,#6B5A63) shadow-[0_4px_10px_rgba(31,23,32,0.04)] sm:self-auto">
                      {doneGoals.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {doneGoals.map((g) => (
                      <GoalCard
                        key={g.id}
                        goal={g}
                        tone="done"
                        onEdit={() => onEdit(g)}
                        onDelete={() => onDelete(g.id)}
                        onToggleStep={(stepId, nextDone) => onToggleStep(g.id, stepId, nextDone)}
                      />
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          ) : null}
        </div>
      )}
    </Card>
  );
}
