"use client";

import * as React from "react";
import type { Resource } from "../lib/goalTypes";
import { cn, toNiceDate } from "../lib/goalTypes";

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-[28px] border border-black/5 shadow-sm p-5 sm:p-6"
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

function ResourceRow({ res }: { res: Resource }) {
  const chip =
    res.type === "PDF"
      ? "bg-gray-100 text-gray-800 ring-1 ring-gray-200"
      : res.type === "Audio"
      ? "bg-indigo-50 text-indigo-800 ring-1 ring-indigo-100"
      : res.type === "Fișă"
      ? "bg-pink-50 text-pink-800 ring-1 ring-pink-100"
      : "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100";

  return (
    <div
      className="rounded-2xl border border-black/5 p-4 shadow-sm"
      style={{
        background:
          "linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(224,231,255,0.7) 100%)",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{res.title}</p>
          {res.description ? <p className="mt-0.5 text-sm text-gray-600 leading-relaxed">{res.description}</p> : null}
          <p className="mt-2 text-xs text-gray-500">Adăugat {toNiceDate(res.addedAt)}</p>
        </div>

        <div className="shrink-0 flex flex-col items-end gap-2">
          <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", chip)}>
            {res.type}
          </span>

          {res.href ? (
            <a href={res.href} className="text-sm font-semibold text-indigo-700 hover:text-indigo-800 transition">
              Deschide →
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function ResourcesSection({
  loading,
  resources,
  onAdd,
}: {
  loading: boolean;
  resources: Resource[];
  onAdd: () => void;
}) {
  return (
    <Card>
      <CardHeader
        title="Resurse"
        subtitle="Fișe, audio, linkuri — tot într-un loc."
        right={
          <button
            type="button"
            onClick={onAdd}
            className="text-sm font-semibold text-indigo-700 hover:text-indigo-800 transition"
          >
            Adaugă
          </button>
        }
      />

      {loading ? (
        <div className="mt-5 space-y-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl border border-black/5 p-4 shadow-sm"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(224,231,255,0.7) 100%)",
              }}
            >
              <div className="h-4 w-1/2 rounded bg-gray-200" />
              <div className="mt-2 h-3 w-2/3 rounded bg-gray-100" />
              <div className="mt-3 h-3 w-1/4 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      ) : resources.length === 0 ? (
        <EmptyState
          title="Încă nu ai resurse"
          subtitle="Terapeutul poate trimite aici materiale."
          cta="Adaugă o resursă"
          onClick={onAdd}
        />
      ) : (
        <div className="mt-5 space-y-3">
          {resources.map((r) => (
            <ResourceRow key={r.id} res={r} />
          ))}
        </div>
      )}
    </Card>
  );
}