"use client";

import * as React from "react";
import type { Goal } from "../lib/goalTypes";
import { cn } from "../lib/goalTypes";
import GoalCard from "./GoalCard";

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-3xl border border-black/5 shadow-sm p-6 sm:p-7"
      style={{
        background:
          "linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(224,231,255,0.7) 100%)",
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
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-base font-semibold text-gray-900">{title}</p>
        <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
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
      className="mt-5 bg-white/70 rounded-3xl border border-dashed border-black/10 p-8 text-center"
    >
      <p className="text-sm font-semibold text-gray-900">{title}</p>
      <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
      <button
        type="button"
        onClick={onClick}
        className="mt-4 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
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
              "text-sm font-semibold transition",
              addingGoal ? "text-indigo-700/60 cursor-not-allowed" : "text-indigo-700 hover:text-indigo-800"
            )}
          >
            {addingGoal ? "Se adaugă…" : "Adaugă"}
          </button>
        }
      />

      {loading ? (
        <div className="mt-5 space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl border border-black/5 p-4 shadow-sm"
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
        <div className="mt-5 space-y-3">
          {activeGoals.map((g) => (
            <GoalCard
              key={g.id}
              goal={g}
              tone="active"
              onEdit={() => onEdit(g)}
              onDelete={() => onDelete(g.id)}
            />
          ))}

          {pausedGoals.length ? (
            <div className="pt-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">În pauză</p>
              <div className="mt-2 space-y-3">
                {pausedGoals.map((g) => (
                  <GoalCard
                    key={g.id}
                    goal={g}
                    tone="paused"
                    onEdit={() => onEdit(g)}
                    onDelete={() => onDelete(g.id)}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {doneGoals.length ? (
            <div className="pt-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Încheiate</p>
              <div className="mt-2 space-y-3">
                {doneGoals.map((g) => (
                  <GoalCard
                    key={g.id}
                    goal={g}
                    tone="done"
                    onEdit={() => onEdit(g)}
                    onDelete={() => onDelete(g.id)}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </Card>
  );
}