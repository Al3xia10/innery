"use client";

import * as React from "react";
import type { Exercise } from "../lib/goalTypes";

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-3xl border border-black/5 shadow-sm p-5 sm:p-6"
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
    <div className="mt-5 rounded-3xl border border-dashed border-black/10 bg-white/70 p-8 text-center">
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

function ExerciseCard({ ex }: { ex: Exercise }) {
  const chip =
    ex.kind === "Rutină"
      ? "bg-indigo-50 text-indigo-800 ring-1 ring-indigo-100"
      : ex.kind === "Experiment"
      ? "bg-pink-50 text-pink-800 ring-1 ring-pink-100"
      : "bg-gray-100 text-gray-800 ring-1 ring-gray-200";

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-black/5 shadow-sm p-4"
      style={{
        background:
          "linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(224,231,255,0.45) 100%)",
      }}
    >
      <div
        className="absolute inset-x-0 top-0 h-0.5"
        style={{
          background:
            "linear-gradient(90deg, rgba(99,102,241,0.55), rgba(236,72,153,0.30), rgba(255,255,255,0))",
        }}
        aria-hidden="true"
      />

      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-gray-900 min-w-0 truncate">{ex.title}</p>
        <span className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${chip}`}>
          {ex.kind}
        </span>
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
        <span>{typeof ex.minutes === "number" ? `${ex.minutes} min` : "—"}</span>
        <span>între ședințe</span>
      </div>

      {ex.note ? <p className="mt-3 text-sm text-gray-700 leading-relaxed">{ex.note}</p> : null}

      <button
        type="button"
        className="mt-4 inline-flex items-center justify-center rounded-xl border border-black/10 bg-white/80 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-white transition w-full"
      >
        Marchează ca făcut (demo)
      </button>
    </div>
  );
}

export default function ExercisesSection({
  loading,
  exercises,
  onAdd,
}: {
  loading: boolean;
  exercises: Exercise[];
  onAdd: () => void;
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
            className="text-sm font-semibold text-indigo-700 hover:text-indigo-700/80 transition"
          >
            Adaugă
          </button>
        }
      />

      {loading ? (
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-black/5 bg-white/80 p-4 shadow-sm">
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
            <ExerciseCard key={e.id} ex={e} />
          ))}
        </div>
      )}
    </Card>
  );
}