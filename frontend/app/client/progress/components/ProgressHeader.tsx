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
       <header
      className="rounded-[28px] border border-black/5 p-4 shadow-sm sm:rounded-4xl sm:p-7 lg:p-8"
      style={{
        background:
          "linear-gradient(135deg,#ffffff 0%,rgba(239,208,202,0.18) 60%,rgba(125,128,218,0.08) 100%)",
      }}
    >
      <div className="flex flex-col gap-8">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_260px] xl:items-start">
          <div className="max-w-2xl">
            

            <h1 className="mt-2 text-[1.7rem] font-semibold leading-[1.05] tracking-tight text-foreground sm:mt-4 sm:text-[2.55rem]">
              Progressul tău
            </h1>
            <p className="mt-2 max-w-2xl text-[15px] leading-6 sm:mt-3 sm:leading-8 text-(--color-foreground-muted,#6B5A63) sm:text-[17px]">
              Vezi cum se așază ritmul tău în timp.
            </p>

          
          </div>

          <div className="flex flex-col gap-2.5 xl:flex-row xl:items-start xl:justify-end">
            <div className="mt-2 w-full rounded-[20px] border border-(--color-soft) bg-white p-1 shadow-[0_8px_18px_rgba(31,23,32,0.06)] xl:mt-4 xl:w-auto sm:rounded-full">
              <PillToggle value={range} onChange={setRange} />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="rounded-[20px] bg-[linear-gradient(135deg,var(--color-warm)_0%,var(--color-accent)_50%,var(--color-primary)_100%)] p-4 shadow-[0_16px_34px_rgba(210,140,180,0.16)] sm:rounded-[28px] sm:p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-foreground-muted, #6B5A63)]">
              cum să te uiți la date
            </p>
            <p className="mt-3 max-w-2xl text-[15px] leading-6 sm:mt-4 sm:leading-8 text-[var(--color-foreground-muted, #6B5A63)]">
              Privește progresul cu blândețe.
            </p>
            <ul className="mt-3 grid grid-cols-1 gap-2.5 text-sm leading-6 text-foreground lg:mt-4 lg:grid-cols-3">
              <li>
                <div className="rounded-[18px] bg-(--color-card) px-3 py-2.5 text-[13px] font-medium text-foreground shadow-[0_6px_12px_rgba(180,120,150,0.14)]">
                  vezi evoluția în timp
                </div>
              </li>
              <li>
                <div className="rounded-[18px] bg-(--color-card) px-3 py-2.5 text-[13px] font-medium text-foreground shadow-[0_6px_12px_rgba(180,120,150,0.14)]">
                  compară ultimele zile
                </div>
              </li>
              <li>
                <div className="rounded-[18px] bg-(--color-card) px-3 py-2.5 text-[13px] font-medium text-foreground shadow-[0_6px_12px_rgba(180,120,150,0.14)]">
                  caută tipare repetate
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
}