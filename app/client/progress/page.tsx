"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/app/_lib/authClient";

type RangeKey = "7" | "30";

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function PillToggle({
  value,
  onChange,
}: {
  value: RangeKey;
  onChange: (v: RangeKey) => void;
}) {
  return (
    <div className="inline-flex items-center rounded-full border border-white/60 bg-white/70 backdrop-blur p-1 shadow-sm">
      <button
        type="button"
        onClick={() => onChange("7")}
        className={cn(
          "rounded-full px-3 py-1.5 text-xs font-semibold transition",
          value === "7"
            ? "bg-indigo-600 text-white shadow-sm"
            : "text-gray-700 hover:bg-white"
        )}
      >
        7 zile
      </button>
      <button
        type="button"
        onClick={() => onChange("30")}
        className={cn(
          "rounded-full px-3 py-1.5 text-xs font-semibold transition",
          value === "30"
            ? "bg-indigo-600 text-white shadow-sm"
            : "text-gray-700 hover:bg-white"
        )}
      >
        30 zile
      </button>
    </div>
  );
}

function SoftCard({
  title,
  subtitle,
  right,
  children,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-white/60 bg-white/70 backdrop-blur-xl p-6 sm:p-7 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-gray-600">{subtitle}</p> : null}
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function MetricChip({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "good" | "warm";
}) {
  const toneClass =
    tone === "good"
      ? "bg-emerald-50 text-emerald-800 border-emerald-100"
      : tone === "warm"
      ? "bg-amber-50 text-amber-800 border-amber-100"
      : "bg-gray-50 text-gray-800 border-gray-100";

  return (
    <div className={cn("rounded-2xl border px-4 py-3", toneClass)}>
      <p className="text-xs font-semibold opacity-80">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

function ChartPlaceholder({
  label,
  hint,
  loading,
  empty,
}: {
  label: string;
  hint: string;
  loading: boolean;
  empty: boolean;
}) {
  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-4 w-40 rounded bg-gray-200/60 animate-pulse" />
        <div className="h-28 w-full rounded-2xl bg-gray-200/60 animate-pulse" />
        <div className="h-3 w-64 rounded bg-gray-200/60 animate-pulse" />
      </div>
    );
  }

  if (empty) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white/60 p-5">
        <p className="text-sm font-semibold text-gray-900">Încă nu avem trend-uri</p>
        <p className="mt-1 text-sm text-gray-600">{hint}</p>
        <Link
          href="/client"
          className="mt-4 inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition"
        >
          Fă un check-in azi
        </Link>
      </div>
    );
  }

  // Later: replace with a real chart
  return (
    <div className="rounded-2xl border border-gray-100 bg-white/60 p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-gray-900">{label}</p>
        <span className="text-xs text-gray-500">vizualizare (curând)</span>
      </div>

      <div className="mt-4 h-28 w-full rounded-2xl bg-linear-to-br from-rose-50 to-indigo-50 border border-white/60 shadow-sm flex items-end gap-2 p-4">
        {[18, 28, 22, 35, 26, 40, 32].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-full bg-indigo-200/70"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>

      <p className="mt-3 text-xs text-gray-500">
        Curând: grafic real (mood/anxietate/energie) + filtrare pe 7/30 zile.
      </p>
    </div>
  );
}

export default function ProgressPage() {
  const [range, setRange] = useState<RangeKey>("7");
  const [loading, setLoading] = useState(true);
  const [checkins, setCheckins] = useState<any[]>([]);

  useEffect(() => {
    // Momentan doar pregătim UI; endpoint-ul îl legăm imediat după (list check-ins).
    // În pasul următor: GET /api/client/checkins?range=7|30
    setLoading(false);
  }, []);

  const empty = useMemo(() => checkins.length === 0, [checkins.length]);

  return (
    <section className="relative">
      {/* soft canvas */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-10 -left-10 h-72 w-72 rounded-full bg-white/60 blur-3xl" />
        <div className="absolute top-24 -right-10 h-80 w-80 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-rose-200/40 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-7">
        {/* HEADER */}
        <header className="rounded-4xl border border-white/60 bg-white/70 backdrop-blur-xl shadow-sm overflow-hidden">
          <div className="relative px-6 py-7 sm:px-10 sm:py-10">
            <div className="absolute inset-0 bg-linear-to-br from-white/50 to-white/10" />
            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-3 py-1 text-xs font-semibold text-gray-700 shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                  Progress
                </div>
                <h1 className="mt-3 text-2xl sm:text-3xl font-semibold text-gray-900">
                  Observă, fără judecată
                </h1>
                <p className="mt-2 text-sm text-gray-600 max-w-2xl">
                  Trend-uri simple din check-in-urile tale. Nu e despre perfecțiune — e despre
                  a vedea ce se schimbă în timp.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <PillToggle value={range} onChange={setRange} />
                <Link
                  href="/client/journal"
                  className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition"
                >
                  Scrie în jurnal
                </Link>
              </div>
            </div>

            {/* small highlight strip */}
            <div className="relative mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <MetricChip
                label="Fereastră"
                value={range === "7" ? "Ultimele 7 zile" : "Ultimele 30 zile"}
                tone="neutral"
              />
              <MetricChip label="Consistență" value={empty ? "—" : "În calcul (curând)"} tone="warm" />
              <MetricChip label="Insight-uri" value={empty ? "0" : "În curând"} tone="good" />
            </div>
          </div>
        </header>

        {/* GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SoftCard
            title={`Mood (${range} zile)`}
            subtitle="Cum a fost tonul general în perioada asta?"
            right={<span className="text-xs text-gray-500">0–10</span>}
          >
            <ChartPlaceholder
              label="Mood"
              hint="Completează 2-3 check-in-uri ca să vezi trenduri."
              loading={loading}
              empty={empty}
            />
          </SoftCard>

          <SoftCard
            title={`Anxietate (${range} zile)`}
            subtitle="Cât de intensă a fost anxietatea?"
            right={<span className="text-xs text-gray-500">0–10</span>}
          >
            <ChartPlaceholder
              label="Anxietate"
              hint="Avem nevoie de câteva check-in-uri ca să conturăm un tipar."
              loading={loading}
              empty={empty}
            />
          </SoftCard>

          <SoftCard
            title={`Energie (${range} zile)`}
            subtitle="Nivelul tău de energie, zi după zi."
            right={<span className="text-xs text-gray-500">0–10</span>}
          >
            <ChartPlaceholder
              label="Energie"
              hint="După câteva check-in-uri, vei vedea dacă somnul îți influențează energia."
              loading={loading}
              empty={empty}
            />
          </SoftCard>

          <SoftCard
            title="Insight-uri (simplu)"
            subtitle="Concluzii mici, utile — fără AI, doar reguli clare."
            right={
              <span className="text-xs font-semibold text-gray-500">
                {empty ? "demo" : "live (curând)"}
              </span>
            }
          >
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="rounded-2xl border border-white/60 bg-white/60 p-4 shadow-sm">
                • În zilele cu somn mai bun, e posibil să ai energie mai mare.
              </li>
              <li className="rounded-2xl border border-white/60 bg-white/60 p-4 shadow-sm">
                • După ședințe, mood-ul se poate stabiliza.
              </li>
              <li className="rounded-2xl border border-white/60 bg-white/60 p-4 shadow-sm">
                • Când anxietatea crește, uneori energia scade — observă fără vină.
              </li>
            </ul>
            <p className="mt-4 text-xs text-gray-500">
              (Le calculăm automat după ce adăugăm endpoint-ul de listare:{" "}
              <span className="font-mono">/api/client/checkins</span>.)
            </p>
          </SoftCard>
        </div>

        {/* bottom note */}
        <div className="rounded-[28px] border border-white/60 bg-white/60 backdrop-blur-xl p-6 shadow-sm">
          <p className="text-sm text-gray-700">
            Mic reminder: dacă o zi a fost grea, nu “strică” progresul. E doar o zi.
          </p>
        </div>
      </div>
    </section>
  );
}