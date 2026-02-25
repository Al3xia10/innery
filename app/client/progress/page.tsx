"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/app/_lib/authClient";


type RangeKey = "7" | "30";

type ProgressPoint = {
  day: string; // YYYY-MM-DD
  mood: number | null;
  anxiety: number | null;
  energy: number | null;
  sleepHours: number | null;
  count: number;
};

type ProgressInsight = {
  id: string;
  text: string;
};
type ProgressSummary = {
  bestDay: { day: string; mood: number } | null;
  toughestDay: { day: string; mood: number } | null;
  missingDays: string[];
  trend: { label: string; hint: string } | null;
};

type ProgressResponse = {
  progress: {
    rangeDays: number;
    series: ProgressPoint[];
    insights: ProgressInsight[];
    summary?: ProgressSummary;
  };
};

function fmtDay(day: string) {
  const d = new Date(day + "T00:00:00.000Z");
  return d.toLocaleDateString("ro-RO", { day: "2-digit", month: "short" });
}

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
  values,
}: {
  label: string;
  hint: string;
  loading: boolean;
  empty: boolean;
  values: number[];
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

  const safe = values.map((v) => (Number.isFinite(v) ? Math.max(0, Math.min(10, v)) : 0));
  const max = Math.max(1, ...safe);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white/60 p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-gray-900">{label}</p>
        <span className="text-xs text-gray-500">ultimele {safe.length} check-in-uri</span>
      </div>

      <div className="mt-4 h-28 w-full rounded-2xl bg-linear-to-br from-rose-50 to-indigo-50 border border-white/60 shadow-sm flex items-end gap-2 p-4 overflow-hidden">
        {safe.slice(-14).map((v, i) => {
          const h = (v / max) * 100;
          return (
            <div
              key={i}
              className="flex-1 min-w-0 rounded-full bg-indigo-200/70"
              style={{ height: `${Math.max(10, h)}%` }}
              aria-label={`${label} ${v}/10`}
              title={`${label}: ${v}/10`}
            />
          );
        })}
      </div>

      <p className="mt-3 text-xs text-gray-500">
        Tip: urmărește direcția, nu o singură zi. Dacă vrei, notează un context scurt în jurnal.
      </p>
    </div>
  );
}

function Toast({
  kind,
  message,
  onClose,
}: {
  kind: "error" | "success";
  message: string;
  onClose: () => void;
}) {
  return (
    <div
      role="status"
      className={cn(
        "fixed right-4 top-4 z-50 w-[min(92vw,380px)] rounded-2xl border bg-white/90 backdrop-blur shadow-lg p-4",
        kind === "error" ? "border-rose-200" : "border-emerald-200"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "mt-0.5 h-2.5 w-2.5 rounded-full",
            kind === "error" ? "bg-rose-500" : "bg-emerald-500"
          )}
        />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900">
            {kind === "error" ? "Ups" : "Gata"}
          </p>
          <p className="mt-0.5 text-sm text-gray-600 leading-relaxed">{message}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-xl hover:bg-gray-100 transition"
          aria-label="Închide"
          title="Închide"
        >
          <span className="text-gray-500">✕</span>
        </button>
      </div>
    </div>
  );
}

export default function ProgressPage() {
  const router = useRouter();

  const [range, setRange] = useState<RangeKey>("7");
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [series, setSeries] = useState<ProgressPoint[]>([]);
  const [insights, setInsights] = useState<ProgressInsight[]>([]);
  const [toast, setToast] = useState<{ kind: "error" | "success"; message: string } | null>(null);
  const [backendSummary, setBackendSummary] = useState<ProgressSummary | null>(null);

  useEffect(() => {
    const onFocus = () => setRefreshKey((k) => k + 1);
    const onVis = () => {
      if (document.visibilityState === "visible") setRefreshKey((k) => k + 1);
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  useEffect(() => {
    let alive = true;
    const ctrl = new AbortController();

    (async () => {
      try {
        setLoading(true);

        // Expected (preferred): { progress: { rangeDays, series: [...], insights: [...] } }
        // But we also accept: { series, insights } OR { checkins: [...] } OR a raw array.
        const data = await apiFetch(`/api/client/progress?range=${range}`, {
          method: "GET",
          signal: ctrl.signal as any,
          // prevent any caching surprises (ETag/304)
          cache: "no-store",
          headers: {
            "Cache-Control": "no-store",
            Pragma: "no-cache",
          },
        });

        const prog = (data as ProgressResponse)?.progress ?? data;
        const progAny: any = prog;
        const dataAny: any = data;

        // If backend provides a summary, we use it (range-aware). Otherwise we compute it from series.
        const incomingSummary = (prog as any)?.summary ?? null;

        const toNum = (v: any) => {
          if (v == null) return null;
          const n = typeof v === "string" ? Number(v) : v;
          return Number.isFinite(n) ? Number(n) : null;
        };

        const toDay = (raw: any) => {
          const d = new Date(String(raw));
          if (Number.isNaN(d.getTime())) return null;
          // group by UTC day for consistency with backend timestamps
          return d.toISOString().slice(0, 10);
        };

        const buildSeriesFromCheckins = (checkins: any[]): ProgressPoint[] => {
          const map = new Map<
            string,
            {
              mood: number[];
              anxiety: number[];
              energy: number[];
              sleepHours: number[];
              count: number;
            }
          >();

          for (const c of checkins) {
            const day = toDay(c?.createdAt ?? c?.created_at ?? c?.date ?? c?.day);
            if (!day) continue;

            if (!map.has(day)) {
              map.set(day, { mood: [], anxiety: [], energy: [], sleepHours: [], count: 0 });
            }

            const bucket = map.get(day)!;
            const mood = toNum(c?.mood);
            const anxiety = toNum(c?.anxiety);
            const energy = toNum(c?.energy);
            const sleepHours = toNum(c?.sleepHours ?? c?.sleep_hours);

            if (mood != null) bucket.mood.push(mood);
            if (anxiety != null) bucket.anxiety.push(anxiety);
            if (energy != null) bucket.energy.push(energy);
            if (sleepHours != null) bucket.sleepHours.push(sleepHours);

            bucket.count += 1;
          }

          const avgArr = (arr: number[]) => {
            if (!arr.length) return null;
            const s = arr.reduce((a, b) => a + b, 0);
            return Math.round((s / arr.length) * 10) / 10;
          };

          return Array.from(map.entries())
            .map(([day, b]) => ({
              day,
              mood: avgArr(b.mood),
              anxiety: avgArr(b.anxiety),
              energy: avgArr(b.energy),
              sleepHours: avgArr(b.sleepHours),
              count: b.count,
            }))
            .sort((a, b) => (a.day < b.day ? -1 : a.day > b.day ? 1 : 0));
        };

        const buildInsights = (s: ProgressPoint[]): ProgressInsight[] => {
          if (!s.length) return [];

          const pick = (k: keyof ProgressPoint) =>
            s.map((p) => (typeof p[k] === "number" ? (p[k] as number) : null)).filter((v): v is number => v != null);

          const avg1 = (arr: number[]) =>
            arr.length ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10 : null;

          const mood = pick("mood");
          const anxiety = pick("anxiety");
          const energy = pick("energy");
          const sleep = pick("sleepHours");

          const avgMood = avg1(mood);
          const avgAnx = avg1(anxiety);
          const avgEn = avg1(energy);
          const avgSleep = avg1(sleep);

          const out: ProgressInsight[] = [];

          if (avgMood != null) {
            out.push({
              id: "avg_mood",
              text:
                avgMood >= 7
                  ? "În perioada asta, mood-ul tău pare stabil și destul de bun. Păstrează ce funcționează."
                  : avgMood >= 5
                  ? "Mood-ul tău e în zona de mijloc — e un semn bun că observi și te reglezi."
                  : "Mood-ul a fost mai jos în perioada asta. Fii blând(ă) cu tine — e ok să ceri sprijin.",
            });
          }

          if (avgAnx != null) {
            out.push({
              id: "avg_anxiety",
              text:
                avgAnx >= 7
                  ? "Anxietatea a fost mai intensă. Poate ajută să notezi în jurnal ce o declanșează."
                  : avgAnx >= 5
                  ? "Anxietatea apare, dar nu pare să fie constant sus. Observă tiparele fără judecată."
                  : "Anxietatea pare relativ scăzută în perioada asta. E un semn bun.",
            });
          }

          if (avgSleep != null && avgEn != null) {
            if (avgSleep >= 7 && avgEn >= 6) {
              out.push({ id: "sleep_energy_good", text: "Somnul bun pare să-ți susțină energia. Continuă ritualul care te ajută." });
            } else if (avgSleep < 6 && avgEn < 6) {
              out.push({ id: "sleep_energy_low", text: "Somnul mai scurt poate influența energia. Un pas mic: 20–30 min mai devreme la culcare." });
            }
          }

          // Keep it short: max 4
          return out.slice(0, 4);
        };

        let nextSeries: ProgressPoint[] = Array.isArray(prog?.series) ? prog.series : [];
        let nextInsights: ProgressInsight[] = Array.isArray(prog?.insights) ? prog.insights : [];

        // Fallback: if backend returns checkins instead of aggregated series
        if (!nextSeries.length) {
          const rawCheckins =
            Array.isArray(progAny?.checkins)
              ? progAny.checkins
              : Array.isArray(dataAny?.checkins)
              ? dataAny.checkins
              : Array.isArray(progAny)
              ? progAny
              : [];

          if (Array.isArray(rawCheckins) && rawCheckins.length) {
            nextSeries = buildSeriesFromCheckins(rawCheckins);
            if (!nextInsights.length) nextInsights = buildInsights(nextSeries);
          }
        }

        if (!alive) return;
        setSeries(nextSeries);
        setInsights(nextInsights);
        setBackendSummary(incomingSummary);
      } catch (e: any) {
        if (!alive) return;

        // apiFetch typically throws; try to detect auth.
        const msg = String(e?.message ?? e ?? "Eroare necunoscută");
        if (msg.toLowerCase().includes("401") || msg.toLowerCase().includes("unauthorized")) {
          setToast({ kind: "error", message: "Sesiunea a expirat. Te rugăm să te reconectezi." });
          router.replace("/login");
          return;
        }

        setToast({ kind: "error", message: "Nu am putut încărca progresul. Încearcă din nou." });
        setSeries([]);
        setInsights([]);
        setBackendSummary(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
      ctrl.abort();
    };
  }, [range, refreshKey, router]);

  const empty = useMemo(() => series.length === 0, [series]);

  const byDayAsc = useMemo(() => {
    return series
      .slice()
      .sort((a, b) => {
        const da = new Date(a.day + "T00:00:00Z").getTime();
        const db = new Date(b.day + "T00:00:00Z").getTime();
        return da - db;
      });
  }, [series]);

  const seriesMood = useMemo(() => byDayAsc.map((p) => (p.mood == null ? 0 : Number(p.mood))), [byDayAsc]);
  const seriesAnxiety = useMemo(() => byDayAsc.map((p) => (p.anxiety == null ? 0 : Number(p.anxiety))), [byDayAsc]);
  const seriesEnergy = useMemo(() => byDayAsc.map((p) => (p.energy == null ? 0 : Number(p.energy))), [byDayAsc]);
  const seriesSleep = useMemo(
    () => byDayAsc.map((p) => (p.sleepHours == null ? 0 : Number(p.sleepHours))),
    [byDayAsc]
  );

  const avg = (vals: number[]) => {
  const filtered = vals.filter((v) => Number.isFinite(v) && v >= 0);
  const nonZero = filtered.filter((v) => v !== 0);
  if (nonZero.length === 0) return null;
  const s = nonZero.reduce((acc, v) => acc + v, 0);
  return Math.round((s / nonZero.length) * 10) / 10;
};

  const avgMood = useMemo(() => avg(seriesMood), [seriesMood]);
const avgAnxiety = useMemo(() => avg(seriesAnxiety), [seriesAnxiety]);
const avgEnergy = useMemo(() => avg(seriesEnergy), [seriesEnergy]);
const avgSleep = useMemo(() => avg(seriesSleep), [seriesSleep]);

const checkinDays = useMemo(
  () => byDayAsc.filter((p) => (Number(p.count) || 0) > 0).length,
  [byDayAsc]
);

const missingDays = useMemo(
  () => byDayAsc.filter((p) => (Number(p.count) || 0) === 0).map((p) => p.day),
  [byDayAsc]
);

const currentStreak = useMemo(() => {
  const desc = byDayAsc.slice().sort((a, b) => (a.day < b.day ? 1 : a.day > b.day ? -1 : 0));
  let streak = 0;
  for (const p of desc) {
    if ((Number(p.count) || 0) > 0) streak += 1;
    else break;
  }
  return streak;
}, [byDayAsc]);

const trend = useMemo(() => {
  const vals = byDayAsc
    .filter((p) => (Number(p.count) || 0) > 0)
    .map((p) => ({ mood: p.mood }));

  if (vals.length < 4) return null;

  const mid = Math.max(1, Math.floor(vals.length / 2));
  const prev = vals.slice(0, mid);
  const recent = vals.slice(mid);

  const avgK = (arr: any[]) => {
    const nums = arr
      .map((x) => (typeof x.mood === "number" ? x.mood : null))
      .filter((v: any) => typeof v === "number");
    if (!nums.length) return null;
    const s = nums.reduce((a: number, b: number) => a + b, 0);
    return s / nums.length;
  };

  const aPrev = avgK(prev);
  const aRecent = avgK(recent);
  if (aPrev == null || aRecent == null) return null;

  const diff = aRecent - aPrev;
  if (Math.abs(diff) < 0.35) return { label: "stabil", hint: "aproape constant" };
  return diff > 0
    ? { label: "în creștere", hint: "mai bine în ultima perioadă" }
    : { label: "în scădere", hint: "mai dificil în ultima perioadă" };
}, [byDayAsc]);



const computedSummary = useMemo<ProgressSummary>(() => {
  const missing = byDayAsc.filter((p) => (Number(p.count) || 0) === 0).map((p) => p.day);

  const days = byDayAsc.filter(
    (p) => (Number(p.count) || 0) > 0 && typeof p.mood === "number"
  );

  let best: { day: string; mood: number } | null = null;
  let tough: { day: string; mood: number } | null = null;

  for (const d of days) {
    const mood = d.mood as number;
    if (!best || mood > best.mood) best = { day: d.day, mood };
    if (!tough || mood < tough.mood) tough = { day: d.day, mood };
  }

  return {
    bestDay: best,
    toughestDay: tough,
    missingDays: missing,
    trend,
  };
}, [byDayAsc, trend]);

const summary = useMemo(
  () => backendSummary ?? computedSummary,
  [backendSummary, computedSummary]
);

  return (
    <section className="relative">
      {toast ? (
        <Toast kind={toast.kind} message={toast.message} onClose={() => setToast(null)} />
      ) : null}
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
            <div className="relative mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
  <MetricChip
    label="Fereastră"
    value={range === "7" ? "Ultimele 7 zile" : "Ultimele 30 zile"}
    tone="neutral"
  />
  <MetricChip
    label="Zile cu check-in"
    value={`${checkinDays}/${byDayAsc.length || (range === "7" ? 7 : 30)}`}
    tone={checkinDays >= Math.ceil((range === "7" ? 7 : 30) * 0.6) ? "good" : "warm"}
  />
  <MetricChip
    label="Streak"
    value={currentStreak ? `${currentStreak} zile la rând` : "—"}
    tone={currentStreak >= 3 ? "good" : "neutral"}
  />
  <MetricChip
    label="Mood mediu"
    value={avgMood == null ? "—" : `${avgMood}/10`}
    tone="warm"
  />
</div>

<div className="relative mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
  <MetricChip
    label="Energie medie"
    value={avgEnergy == null ? "—" : `${avgEnergy}/10`}
    tone="good"
  />
  <MetricChip
    label="Somn mediu"
    value={avgSleep == null ? "—" : `${avgSleep} h`}
    tone="neutral"
  />
  <MetricChip
    label="Trend mood"
    value={summary.trend ? summary.trend.label : "—"}
    tone={
      summary.trend?.label === "în creștere"
        ? "good"
        : summary.trend?.label === "în scădere"
        ? "warm"
        : "neutral"
    }
  />
  <MetricChip
    label="Zile lipsă"
    value={summary.missingDays.length ? `${summary.missingDays.length}` : "0"}
    tone={summary.missingDays.length ? "warm" : "good"}
  />
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
              values={seriesMood}
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
              values={seriesAnxiety}
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
              values={seriesEnergy}
            />
          </SoftCard>
          <SoftCard
  title={`Somn (${range} zile)`}
  subtitle="Ore de somn (când alegi să le notezi)."
  right={<span className="text-xs text-gray-500">ore</span>}
>
  <ChartPlaceholder
    label="Somn"
    hint="Dacă vrei, adaugă somnul în check-in ca să vezi relația cu energia."
    loading={loading}
    empty={empty}
    values={seriesSleep}
  />
</SoftCard>

          <SoftCard
            title="Insight-uri (simplu)"
            subtitle="Concluzii mici, utile — reguli clare (trend, consistență, somn)."
            right={
              <span className="text-xs font-semibold text-gray-500">
                {empty
                  ? "în așteptare"
                  : `${series.reduce((s, p) => s + (Number(p.count) || 0), 0)} check-in-uri`}
              </span>
            }
          >
            {loading ? (
              <div className="space-y-3">
                <div className="h-4 w-56 rounded bg-gray-200/60 animate-pulse" />
                <div className="h-4 w-72 rounded bg-gray-200/60 animate-pulse" />
                <div className="h-4 w-64 rounded bg-gray-200/60 animate-pulse" />
              </div>
            ) : empty ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-white/60 p-5">
                <p className="text-sm font-semibold text-gray-900">Încă nu avem insight-uri</p>
                <p className="mt-1 text-sm text-gray-600">
                  Completează câteva check-in-uri ca să putem observa tipare blânde.
                </p>
                <Link
                  href="/client"
                  className="mt-4 inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition"
                >
                  Fă un check-in azi
                </Link>
              </div>
            ) : insights.length ? (
              <>
                <ul className="space-y-2 text-sm text-gray-700">
                  {insights.map((ins) => (
                    <li
                      key={ins.id}
                      className="rounded-2xl border border-white/60 bg-white/60 p-4 shadow-sm"
                    >
                      • {ins.text}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/60 bg-white/60 p-4 shadow-sm">
                    <p className="text-xs font-semibold text-gray-600">Ziua cea mai bună</p>
                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {summary.bestDay ? `${fmtDay(summary.bestDay.day)} · ${summary.bestDay.mood}/10` : "—"}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">Nu ca performanță — doar ca reper.</p>
                  </div>

                <div className="rounded-2xl border border-white/60 bg-white/60 p-4 shadow-sm">
                  <p className="text-xs font-semibold text-gray-600">Ziua mai dificilă</p>
                  <p className="mt-1 text-sm font-semibold text-gray-900">
                    {summary.toughestDay ? `${fmtDay(summary.toughestDay.day)} · ${summary.toughestDay.mood}/10` : "—"}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">Aici merită notat contextul în jurnal.</p>
                </div>
              </div>

                {summary.missingDays.length ? (
                  <div className="mt-4 rounded-2xl border border-dashed border-amber-200 bg-amber-50/60 p-4">
                    <p className="text-sm font-semibold text-amber-900">Zile fără check-in</p>
                    <p className="mt-1 text-sm text-amber-900/80">
                      {summary.missingDays.length === 1
                        ? "Ai o zi lipsă în fereastra asta. Dacă vrei, completează azi — fără presiune."
                        : `Ai ${summary.missingDays.length} zile lipsă în fereastra asta. Nu e o problemă — doar un reminder blând.`}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {summary.missingDays.slice(0, 7).map((d) => (
                        <span
                          key={d}
                          className="rounded-full border border-amber-200 bg-white/70 px-2.5 py-1 text-xs font-semibold text-amber-900"
                        >
                          {fmtDay(d)}
                        </span>
                      ))}
                      {summary.missingDays.length > 7 ? (
                        <span className="text-xs font-semibold text-amber-900/80">+{summary.missingDays.length - 7}</span>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                {summary.trend ? (
                  <p className="mt-4 text-xs text-gray-500">
                    Trend mood: <span className="font-semibold text-gray-700">{summary.trend.label}</span> — {summary.trend.hint}.
                  </p>
                ) : null}
              </>
            ) : (
              <>
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

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/60 bg-white/60 p-4 shadow-sm">
                    <p className="text-xs font-semibold text-gray-600">Ziua cea mai bună</p>
                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {summary.bestDay ? `${fmtDay(summary.bestDay.day)} · ${summary.bestDay.mood}/10` : "—"}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">Nu ca performanță — doar ca reper.</p>
                  </div>

                  <div className="rounded-2xl border border-white/60 bg-white/60 p-4 shadow-sm">
                    <p className="text-xs font-semibold text-gray-600">Ziua mai dificilă</p>
                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {summary.toughestDay ? `${fmtDay(summary.toughestDay.day)} · ${summary.toughestDay.mood}/10` : "—"}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">Aici merită notat contextul în jurnal.</p>
                  </div>
                </div>

                {summary.missingDays.length ? (
                  <div className="mt-4 rounded-2xl border border-dashed border-amber-200 bg-amber-50/60 p-4">
                    <p className="text-sm font-semibold text-amber-900">Zile fără check-in</p>
                    <p className="mt-1 text-sm text-amber-900/80">
                      {summary.missingDays.length === 1
                        ? "Ai o zi lipsă în fereastra asta. Dacă vrei, completează azi — fără presiune."
                        : `Ai ${summary.missingDays.length} zile lipsă în fereastra asta. Nu e o problemă — doar un reminder blând.`}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {summary.missingDays.slice(0, 7).map((d) => (
                        <span
                          key={d}
                          className="rounded-full border border-amber-200 bg-white/70 px-2.5 py-1 text-xs font-semibold text-amber-900"
                        >
                          {fmtDay(d)}
                        </span>
                      ))}
                      {summary.missingDays.length > 7 ? (
                        <span className="text-xs font-semibold text-amber-900/80">
                          +{summary.missingDays.length - 7}
                        </span>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                {summary.trend ? (
                  <p className="mt-4 text-xs text-gray-500">
                    Trend mood: <span className="font-semibold text-gray-700">{summary.trend.label}</span> — {summary.trend.hint}.
                  </p>
                ) : null}
              </>
            )}
            <p className="mt-4 text-xs text-gray-500">
              Mic hack: când vezi un tipar, notează contextul în jurnal (somn, oameni, stres). Asta face progresul mult mai clar.
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