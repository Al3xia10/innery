"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/app/_lib/authClient";
import { SoftCard } from "./components/SoftCard";
import { useToast } from "@/app/components/ui/toast/ToastProvider";
import { FocusMetricTabs } from "./components/FocusMetricTabs";
import { ProgressChartCard } from "./components/ProgressChartCard";
import { InsightsCard } from "./components/InsightsCard";
import { MinuteCard } from "./components/MinuteCard";
import {ProgressHeader} from "./components/ProgressHeader";


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


type ProgressResponse = {
  progress: {
    rangeDays: number;
    series: ProgressPoint[];
    insights: ProgressInsight[];
  };
};


type FocusMetric = "mood" | "anxiety" | "energy" | "sleep";
export default function ProgressPage() {
  const router = useRouter();
  const toast = useToast();

  const [range, setRange] = useState<RangeKey>("7");
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [series, setSeries] = useState<ProgressPoint[]>([]);
  const [insights, setInsights] = useState<ProgressInsight[]>([]);
    const [contextOpen, setContextOpen] = useState(false);
  const [contextNote, setContextNote] = useState("");
  const [contextTags, setContextTags] = useState<string[]>([]);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [minuteOpen, setMinuteOpen] = useState(false);
  const [focusMetric, setFocusMetric] = useState<FocusMetric>("mood");

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
        
      } catch (e: any) {
        if (!alive) return;

        // apiFetch typically throws; try to detect auth.
        const msg = String(e?.message ?? e ?? "Error necunoscută");
        if (msg.toLowerCase().includes("401") || msg.toLowerCase().includes("unauthorized")) {
          toast.error("Sesiunea a expirat. Te rugăm să te reconectezi.");
          router.replace("/login");
          return;
        }

        toast.error("Nu am putut încărca progresul. Încearcă din nou.");
        setSeries([]);
        setInsights([]);
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

  const metricMeta = useMemo(
    () =>
      ({
        mood: {
          label: "Stare",
          hint: "Completează 2-3 check-in-uri ca să apară repere utile.",
          values: seriesMood,
        },
        anxiety: {
          label: "Tensiune",
          hint: "Avem nevoie de câteva check-in-uri ca să conturăm un tipar.",
          values: seriesAnxiety,
        },
        energy: {
          label: "Energie",
          hint: "După câteva check-in-uri, vei vedea dacă somnul îți influențează energia.",
          values: seriesEnergy,
        },
        sleep: {
          label: "Somn",
          hint: "Dacă vrei, adaugă somnul în check-in ca să vezi relația cu energia.",
          values: seriesSleep,
        },
      }) as const,
    [seriesMood, seriesAnxiety, seriesEnergy, seriesSleep]
  );

  const currentMetric = metricMeta[focusMetric];

  const tagOptions = [
    "somn",
    "stres",
    "oameni",
    "muncă",
    "corp",
    "ședință",
    "menstruație",
    "mișcare",
    "mâncare",
  ];

  const toggleTag = (t: string) => {
    setContextTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  return (
    <section className="relative">      {/* soft canvas */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-10 -left-10 h-72 w-72 rounded-full bg-white/60 blur-3xl" />
        <div className="absolute top-24 -right-10 h-80 w-80 rounded-full bg-(--color-primary)/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-(--color-soft)/15 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-3 py-3 space-y-6 sm:px-6 sm:py-8 sm:space-y-7 lg:px-8">
        {/* HEADER */}
                {/* HEADER */}
        <ProgressHeader range={range} setRange={setRange} />

        {/* GRID */}
                {/* GRID */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
          <SoftCard
            className="lg:col-span-2 rounded-[28px] border border-black/5 shadow-sm sm:rounded-4xl"
            style={{
              background:
                "linear-gradient(135deg,#ffffff 0%,rgba(239,208,202,0.18) 60%,rgba(125,128,218,0.08) 100%)",
            }}
            title={
              range === "7"
                ? "Cum a fost ultima săptămână, per ansamblu"
                : "Cum a fost luna asta, per ansamblu"
            }
            subtitle="Doar un reper blând. O zi nu spune povestea întreagă."
            right={<FocusMetricTabs value={focusMetric} onChange={setFocusMetric} />}
          >
            <ProgressChartCard
              label={currentMetric.label}
              hint={currentMetric.hint}
              loading={loading}
              empty={empty}
              values={currentMetric.values}
            />
</SoftCard>
            
          <InsightsCard
  open={insightsOpen}
  setOpen={setInsightsOpen}
  loading={loading}
  empty={empty}
  insights={insights}
/>
        </div>

        {/* bottom note */}
               
        <MinuteCard open={minuteOpen} setOpen={setMinuteOpen} />
      </div>
    </section>
  );
}