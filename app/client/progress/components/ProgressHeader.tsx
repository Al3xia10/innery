// app/client/progress/components/ProgressHeader.tsx
"use client";

import React from "react";
import Link from "next/link";
import type { RangeKey } from "../types";
import { PillToggle } from "./PillToggle";

export function ProgressHeader({
  range,
  setRange,
}: {
  range: RangeKey;
  setRange: (v: RangeKey) => void;
}) {
  return (
    <header className="rounded-4xl border border-white/60 bg-white/70 backdrop-blur-xl shadow-sm overflow-hidden">
      <div className="relative px-6 py-7 sm:px-10 sm:py-10">
        <div className="absolute inset-0 bg-linear-to-br from-white/50 to-white/10" />

        <div className="relative flex flex-col gap-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-3 py-1 text-xs font-semibold text-gray-700 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                Progress
              </div>

              <h1 className="mt-3 text-2xl sm:text-3xl font-semibold text-gray-900">
                Observă cu blândețe
              </h1>

              <p className="mt-2 text-sm text-gray-600 max-w-2xl">
                Aici nu urmărim perfecțiune. Urmărim să te înțelegi. Numerele sunt doar repere — contextul e mai important.
              </p>

              <div className="mt-4 rounded-[22px] border border-white/60 bg-white/60 backdrop-blur p-5">
                <p className="text-sm font-semibold text-gray-900">Un reminder mic</p>
                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/60 px-3 py-1 text-xs font-semibold text-gray-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  E normal ca starea să fie în valuri. Progresul nu e o linie dreaptă.
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <PillToggle value={range} onChange={setRange} />
              <Link
                href="/client/journal"
                className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
              >
                Scriu un rând
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}