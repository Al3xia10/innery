"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function ProgressChartCard({
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
  values: Array<number | null>; // IMPORTANT: allow nulls => breaks line
}) {
  const [hover, setHover] = useState<null | { x: number; y: number; v: number; idx: number }>(null);

  

  // Keep calm: clamp numeric values to [0..10], keep nulls as null
  const safe = useMemo(() => {
    return values
      .slice(-30)
      .map((v) =>
        v == null || !Number.isFinite(v) ? null : Math.max(0, Math.min(10, Number(v)))
      );
  }, [values]);

  const n = Math.max(2, safe.length);

  // SVG coordinate system
  const W = 720;
  const H = 260;
  const padX = 22;
  const padTop = 18;
  const padBottom = 30;
  const innerW = W - padX * 2;
  const innerH = H - padTop - padBottom;

  const step = innerW / (n - 1);

  // scale by fixed 0..10 (more stable + calmer than autoscaling)
  const toX = (i: number) => padX + i * step;
  const toY = (v: number) => padTop + (1 - v / 10) * innerH;

  // Build segments separated by nulls
  const segments = useMemo(() => {
    const segs: Array<Array<{ x: number; y: number; v: number; idx: number }>> = [];
    let cur: Array<{ x: number; y: number; v: number; idx: number }> = [];

    for (let i = 0; i < safe.length; i++) {
      const v = safe[i];
      if (v == null) {
        if (cur.length) segs.push(cur);
        cur = [];
        continue;
      }
      cur.push({ x: toX(i), y: toY(v), v, idx: i });
    }
    if (cur.length) segs.push(cur);
    return segs;
  }, [safe]);

  const buildSmoothPath = (pts: Array<{ x: number; y: number }>) => {
    if (!pts.length) return "";
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const cur = pts[i];
      const midX = (prev.x + cur.x) / 2;
      const midY = (prev.y + cur.y) / 2;
      d += ` Q ${prev.x} ${prev.y} ${midX} ${midY}`;
    }
    const last = pts[pts.length - 1];
    d += ` T ${last.x} ${last.y}`;
    return d;
  };

  const linePaths = segments.map((seg) => buildSmoothPath(seg));

  // Area only for the longest (or last) segment, keeps it subtle
  const mainSeg = segments.length ? segments[segments.length - 1] : [];
  const mainLine = buildSmoothPath(mainSeg);
  const areaPath =
    mainSeg.length > 1
      ? `${mainLine} L ${mainSeg[mainSeg.length - 1].x} ${padTop + innerH} L ${mainSeg[0].x} ${padTop + innerH} Z`
      : "";

  const pointsFlat = segments.flat();
  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-4 w-40 rounded bg-gray-200/60 animate-pulse" />
        <div className="h-40 w-full rounded-2xl bg-gray-200/60 animate-pulse" />
        <div className="h-3 w-64 rounded bg-gray-200/60 animate-pulse" />
      </div>
    );
  }

  if (empty) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-5">
        <p className="text-sm font-semibold text-gray-900">Încă nu avem suficiente repere</p>
        <p className="mt-1 text-sm text-gray-600">{hint}</p>
        <Link
          href="/client"
          className="mt-4 inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition"
        >
          Dacă vrei, fă un check-in azi
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-gray-900">{label}</p>

        {hover ? (
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            {Math.round(hover.v * 10) / 10}
          </div>
        ) : null}
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="block h-44 sm:h-56 w-full"
          role="img"
          aria-label={`${label} – evoluție în timp`}
          onMouseLeave={() => setHover(null)}
        >
          <defs>
            <linearGradient id="inneryArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(99 102 241)" stopOpacity="0.16" />
              <stop offset="100%" stopColor="rgb(255 255 255)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* soft grid */}
          {Array.from({ length: 4 }).map((_, i) => {
            const y = padTop + (innerH / 4) * (i + 1);
            return (
              <line
                key={`g_${i}`}
                x1={padX}
                x2={padX + innerW}
                y1={y}
                y2={y}
                stroke="rgba(17,24,39,0.06)"
                strokeWidth="1"
              />
            );
          })}

          {/* area (subtle) */}
          {areaPath ? <path d={areaPath} fill="url(#inneryArea)" /> : null}

          {/* line segments (gap-aware) */}
          {linePaths.map((d, i) =>
            d ? (
              <path
                key={`l_${i}`}
                d={d}
                fill="none"
                stroke="rgb(99 102 241)"
                strokeWidth="3"
                strokeLinecap="round"
              />
            ) : null
          )}

          {/* last point marker (on last segment) */}
          {mainSeg.length ? (
            <g>
              <circle
                cx={mainSeg[mainSeg.length - 1].x}
                cy={mainSeg[mainSeg.length - 1].y}
                r={7}
                fill="rgba(255,255,255,0.9)"
              />
              <circle
                cx={mainSeg[mainSeg.length - 1].x}
                cy={mainSeg[mainSeg.length - 1].y}
                r={4}
                fill="rgba(99,102,241,0.9)"
              />
            </g>
          ) : null}

          {/* hover hotspots + custom tooltip */}
          {pointsFlat.map((p) => (
            <g key={`pt_${p.idx}`}>
              <circle
                cx={p.x}
                cy={p.y}
                r={14}
                fill="transparent"
                onMouseMove={() => setHover(p)}
                onFocus={() => setHover(p)}
              />
              <circle
                cx={p.x}
                cy={p.y}
                r={2.5}
                fill={hover?.idx === p.idx ? "rgb(99 102 241)" : "rgba(99,102,241,0.45)"}
              />
            </g>
          ))}

          {hover ? (
            <g>
              {/* tooltip bubble */}
              <g transform={`translate(${Math.min(W - 160, Math.max(10, hover.x - 70))} ${Math.max(10, hover.y - 52)})`}>
                <rect
                  x="0"
                  y="0"
                  width="140"
                  height="36"
                  rx="12"
                  fill="rgba(255,255,255,0.92)"
                  stroke="rgba(17,24,39,0.10)"
                />
                <text x="12" y="22" fontSize="12" fill="rgba(17,24,39,0.78)" fontWeight="600">
                  {label}: {Math.round(hover.v * 10) / 10}
                </text>
              </g>
            </g>
          ) : null}
        </svg>
      </div>

      <p className="mt-3 text-xs text-gray-500">
        Un detaliu mic: uită-te la perioadă, nu la o singură zi. Dacă vrei, notează contextul (somn, stres, oameni) în jurnal.
      </p>
    </div>
  );
}