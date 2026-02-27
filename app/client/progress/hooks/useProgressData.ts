// app/client/progress/hooks/useProgressData.ts
"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/app/_lib/authClient";
import type { ProgressInsight, ProgressPoint, ProgressResponse, RangeKey } from "../types";

export function useProgressData({
  range,
  refreshKey,
  onUnauthorized,
}: {
  range: RangeKey;
  refreshKey: number;
  onUnauthorized: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [series, setSeries] = useState<ProgressPoint[]>([]);
  const [insights, setInsights] = useState<ProgressInsight[]>([]);
  const [toast, setToast] = useState<{ kind: "error" | "success"; message: string } | null>(null);

  useEffect(() => {
    let alive = true;
    const ctrl = new AbortController();

    (async () => {
      try {
        setLoading(true);

        const data = await apiFetch(`/api/client/progress?range=${range}`, {
          method: "GET",
          signal: ctrl.signal as any,
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
          return d.toISOString().slice(0, 10);
        };

        const buildSeriesFromCheckins = (checkins: any[]): ProgressPoint[] => {
          const map = new Map<
            string,
            { mood: number[]; anxiety: number[]; energy: number[]; sleepHours: number[]; count: number }
          >();

          for (const c of checkins) {
            const day = toDay(c?.createdAt ?? c?.created_at ?? c?.date ?? c?.day);
            if (!day) continue;

            if (!map.has(day)) map.set(day, { mood: [], anxiety: [], energy: [], sleepHours: [], count: 0 });

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
            s
              .map((p) => (typeof p[k] === "number" ? (p[k] as number) : null))
              .filter((v): v is number => v != null);

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

          return out.slice(0, 4);
        };

        let nextSeries: ProgressPoint[] = Array.isArray(prog?.series) ? prog.series : [];
        let nextInsights: ProgressInsight[] = Array.isArray(prog?.insights) ? prog.insights : [];

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

        const msg = String(e?.message ?? e ?? "Eroare necunoscută");
        if (msg.toLowerCase().includes("401") || msg.toLowerCase().includes("unauthorized")) {
          setToast({ kind: "error", message: "Sesiunea a expirat. Te rugăm să te reconectezi." });
          onUnauthorized();
          return;
        }

        setToast({ kind: "error", message: "Nu am putut încărca progresul. Încearcă din nou." });
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
  }, [range, refreshKey, onUnauthorized]);

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

  return {
    loading,
    series,
    insights,
    toast,
    setToast,
    empty,
    byDayAsc,
  };
}