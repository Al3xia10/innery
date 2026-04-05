"use client";

import * as React from "react";
import type { Exercise } from "../lib/goalTypes";

type ExerciseWithDone = Exercise & {
  id: string | number;
  done?: boolean;
};

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-[28px] border border-black/5 p-5 shadow-[0_6px_14px_rgba(31,23,32,0.05)] sm:p-6"
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
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-[1rem] font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-[13px] text-(--color-foreground-muted,#6B5A63)">{subtitle}</p>
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
    <div className="mt-5 rounded-3xl border border-black/5 bg-white/80 p-8 text-center shadow-[0_6px_14px_rgba(31,23,32,0.05)]">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-sm text-(--color-foreground-muted,#6B5A63)">{subtitle}</p>
      <button
        type="button"
        onClick={onClick}
        className="mt-4 inline-flex items-center justify-center rounded-2xl bg-(--color-accent) px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(239,135,192,0.18)] transition hover:opacity-95"
      >
        {cta}
      </button>
    </div>
  );
}

function ExerciseCard({
  ex,
  onToggleDone,
  onDelete,
}: {
  ex: ExerciseWithDone;
  onToggleDone: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const chip =
    ex.kind === "Rutină"
      ? "border-[#ead7df] bg-[#fff9fb] text-[#7d5d6c]"
      : ex.kind === "Experiment"
      ? "border-[#dcdcf8] bg-[#f5f4ff] text-[#676cc8]"
      : "border-[#d8ece2] bg-[#f5fbf8] text-[#4f7d6b]";

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border p-4 shadow-[0_6px_14px_rgba(31,23,32,0.05)] ${
        ex.done ? "border-green-200 opacity-90" : "border-black/5"
      }`}
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(252,249,251,0.98) 100%)",
      }}
    >
      <div
        className="absolute inset-x-5 top-0 h-px"
        style={{
          background:
            ex.kind === "Experiment"
              ? "linear-gradient(90deg, rgba(125,128,218,0.75), transparent)"
              : "linear-gradient(90deg, rgba(239,208,202,0.8), transparent)",
        }}
        aria-hidden="true"
      />

      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 truncate text-[1rem] font-semibold tracking-tight text-foreground">{ex.title}</p>
        <span className={`shrink-0 inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${chip}`}>
          {ex.kind}
        </span>
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-(--color-foreground-muted,#6B5A63)">
        <span>{typeof ex.minutes === "number" ? `${ex.minutes} min` : "—"}</span>
        <span>între ședințe</span>
      </div>

      {ex.note ? <p className="mt-3 text-sm leading-relaxed text-(--color-foreground-muted,#6B5A63)">{ex.note}</p> : null}

      <div className="mt-4 flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => onToggleDone(Number(ex.id))}
          className={`inline-flex flex-1 items-center justify-center rounded-2xl border px-3 py-2 text-sm font-semibold shadow-[0_4px_10px_rgba(31,23,32,0.05)] transition ${
            ex.done
              ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
              : "border-black/5 bg-white text-foreground hover:bg-[#fffafb]"
          }`}
        >
          {ex.done ? "Marcat ✓" : "Marchează ca făcut"}
        </button>

        <button
          type="button"
          onClick={() => onDelete(Number(ex.id))}
          className="inline-flex items-center justify-center rounded-2xl border border-black/5 bg-white px-3 py-2 text-sm font-semibold text-(--color-foreground-muted,#6B5A63) shadow-[0_4px_10px_rgba(31,23,32,0.05)] transition hover:bg-black/5 hover:text-foreground"
        >
          Șterge
        </button>
      </div>
    </div>
  );
}

export default function ExercisesSection({
  loading,
  exercises,
  onAdd,
  onToggleDone,
  onDelete,
}: {
  loading: boolean;
  exercises: ExerciseWithDone[];
  onAdd: () => void;
  onToggleDone: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <Card>
      <CardHeader
        title="Exerciții & experimente"
        subtitle="Pași mici între ședințe (îți dau claritate)."
        right={
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center justify-center rounded-2xl bg-(--color-accent) px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(239,135,192,0.18)] transition hover:opacity-95"
          >
            Adaugă
          </button>
        }
      />

      {loading ? (
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse rounded-3xl border border-black/5 bg-white/80 p-4 shadow-[0_6px_14px_rgba(31,23,32,0.05)]">
              <div className="h-4 w-2/3 rounded bg-gray-200" />
              <div className="mt-3 h-3 w-1/3 rounded bg-gray-100" />
              <div className="mt-4 h-3 w-full rounded bg-gray-200" />
            </div>
          ))}
        </div>
      ) : exercises.length === 0 ? (
        <EmptyState
          title="Încă nu ai exerciții"
          subtitle="Poate fi un minut. Chiar și atât contează."
          cta="Adaugă un exercițiu"
          onClick={onAdd}
        />
      ) : (
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {exercises.map((e) => (
            <ExerciseCard
              key={e.id}
              ex={e}
              onToggleDone={onToggleDone}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </Card>
  );
}