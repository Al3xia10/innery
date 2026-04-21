"use client";

import React from "react";
import Link from "next/link";
import { SoftCard } from "./SoftCard";
import type { ProgressInsight } from "../types";

export function InsightsCard({
  open,
  setOpen,
  loading,
  empty,
  insights,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  loading: boolean;
  empty: boolean;
  insights: ProgressInsight[];
}) {
  return (
    <SoftCard
      className="lg:col-span-2 rounded-[28px] border border-black/5 shadow-sm sm:rounded-4xl"
      style={{
        background:
          "linear-gradient(135deg, #ffffff 0%, rgba(239,208,202,0.18) 60%, rgba(125,128,218,0.08) 100%)",
      }}
      title="Ce am observat cu tine"
      subtitle="Opțional — doar dacă simți că te ajută azi."
      right={
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="inline-flex min-h-10 w-full sm:w-auto items-center justify-center rounded-[18px] border border-black/5 bg-(--color-card) px-3 py-2 text-sm font-semibold text-foreground shadow-[0_4px_10px_rgba(31,23,32,0.05)] transition hover:bg-(--color-soft)"
        >
          {open ? "Ascunde" : "Deschide"}
        </button>
      }
    >
      {!open ? (
        <div className="rounded-[20px] border border-black/5 bg-(--color-card) p-4 sm:rounded-[28px]">
          <p className="text-sm text-foreground">
            Uneori e mai blând să rămâi doar cu perioada. Dacă vrei, aici găsești 1–2 observații orientative.
          </p>
        </div>
      ) : loading ? (
        <div className="space-y-3">
          <div className="h-4 w-56 rounded bg-black/5 animate-pulse" />
          <div className="h-4 w-72 rounded bg-black/5 animate-pulse" />
          <div className="h-4 w-64 rounded bg-black/5 animate-pulse" />
        </div>
      ) : empty ? (
        <div className="rounded-[20px] border border-dashed border-black/10 bg-(--color-card) p-5 sm:rounded-[28px]">
          <p className="text-sm font-semibold text-foreground">Încă nu avem repere suficiente</p>
          <p className="mt-1 text-sm leading-6 sm:leading-7 text-(--color-foreground-muted,#6B5A63)">
            Când o să fie câteva check-in-uri, o să putem observa tipare blânde. Fără grabă.
          </p>
          <Link
            href="/client"
            className="mt-4 inline-flex min-h-11 w-full sm:w-auto items-center justify-center rounded-[18px] bg-(--color-primary) px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
          >
            Dacă vrei, fă un check-in azi
          </Link>
        </div>
      ) : insights.length ? (
        <>
          <p className="text-sm leading-6 sm:leading-7 text-(--color-foreground-muted,#6B5A63)">
            Dacă ceva de aici nu se potrivește, e în regulă. Tu îți cunoști contextul cel mai bine.
          </p>

          <ul className="mt-4 space-y-2.5 text-sm text-foreground">
            {insights.slice(0, 2).map((ins) => (
              <li key={ins.id} className="rounded-[18px] border border-black/5 bg-(--color-card) p-4 shadow-[0_4px_10px_rgba(31,23,32,0.05)]">
                • {ins.text}
              </li>
            ))}
          </ul>

          <p className="mt-4 text-xs leading-5 sm:leading-relaxed text-(--color-foreground-muted,#6B5A63)">
            Nu e un verdict. Doar orientativ. Contextul rămâne mai important decât scorul.
          </p>
        </>
      ) : (
        <ul className="space-y-2 text-sm text-foreground">
          <li className="rounded-[18px] border border-black/5 bg-(--color-card) p-4 shadow-[0_4px_10px_rgba(31,23,32,0.05)]">
            • Uneori, când somnul e mai scurt, energia poate scădea. Nu e vina ta — e corpul.
          </li>
          <li className="rounded-[18px] border border-black/5 bg-(--color-card) p-4 shadow-[0_4px_10px_rgba(31,23,32,0.05)]">
            • După ședințe, starea se poate așeza în valuri. E normal să dureze.
          </li>
        </ul>
      )}
    </SoftCard>
  );
}