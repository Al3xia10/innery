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
      className="lg:col-span-2 rounded-3xl border border-black/5 shadow-sm"
      style={{
        background:
          "linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(224,231,255,0.7) 100%)",
      }}
      title="Ce am observat cu tine"
      subtitle="Opțional — doar dacă simți că te ajută azi."
      right={
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition"
        >
          {open ? "Ascunde" : "Deschide"}
        </button>
      }
    >
      {!open ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-700">
            Uneori e mai blând să rămâi doar cu perioada. Dacă vrei, aici găsești 1–2 observații orientative.
          </p>
        </div>
      ) : loading ? (
        <div className="space-y-3">
          <div className="h-4 w-56 rounded bg-gray-200/60 animate-pulse" />
          <div className="h-4 w-72 rounded bg-gray-200/60 animate-pulse" />
          <div className="h-4 w-64 rounded bg-gray-200/60 animate-pulse" />
        </div>
      ) : empty ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-5">
          <p className="text-sm font-semibold text-gray-900">Încă nu avem repere suficiente</p>
          <p className="mt-1 text-sm text-gray-600">
            Când o să fie câteva check-in-uri, o să putem observa tipare blânde. Fără grabă.
          </p>
          <Link
            href="/client"
            className="mt-4 inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
          >
            Dacă vrei, fă un check-in azi
          </Link>
        </div>
      ) : insights.length ? (
        <>
          <p className="text-sm text-gray-600">
            Dacă ceva de aici nu se potrivește, e în regulă. Tu îți cunoști contextul cel mai bine.
          </p>

          <ul className="mt-4 space-y-2 text-sm text-gray-700">
            {insights.slice(0, 2).map((ins) => (
              <li key={ins.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                • {ins.text}
              </li>
            ))}
          </ul>

          <p className="mt-4 text-xs leading-relaxed text-gray-500">
            Nu e un verdict. Doar orientativ. Contextul rămâne mai important decât scorul.
          </p>
        </>
      ) : (
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            • Uneori, când somnul e mai scurt, energia poate scădea. Nu e vina ta — e corpul.
          </li>
          <li className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            • După ședințe, starea se poate așeza în valuri. E normal să dureze.
          </li>
        </ul>
      )}
    </SoftCard>
  );
}