// app/client/progress/components/MinuteCard.tsx
"use client";

import React from "react";
import Link from "next/link";

export function MinuteCard({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  return (
    <section
      className="rounded-3xl border border-black/5 shadow-sm overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(224,231,255,0.7) 100%)",
      }}
    >
      <div className="flex items-center justify-between gap-3 p-6 sm:p-7">
        <div>
          <p className="text-sm font-semibold text-gray-900">Un minut pentru tine</p>
          <p className="mt-1 text-sm text-gray-600">Opțional — doar dacă ai spațiu acum.</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="shrink-0 inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition"
        >
          {open ? "Ascunde" : "Deschide"}
        </button>
      </div>

      {open ? (
        <div className="px-6 pb-6 sm:px-7 sm:pb-7">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-700">
              Dacă vrei: inspiră 4 secunde, ține 4, expiră 6 — de 3 ori.
            </p>
            <p className="mt-2 text-sm text-gray-700">Apoi: „de ce am nevoie acum?”</p>
            <p className="mt-3 text-xs text-gray-500">
              O zi grea nu „strică” nimic. E doar o zi — iar tu ești mai mult decât un grafic.
            </p>
            <div className="mt-4">
              <Link
                href="/client/journal"
                className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
              >
                Scriu un rând
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="px-6 pb-6 sm:px-7 sm:pb-7">
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <p className="text-sm text-gray-700">
              Uneori e suficient să te oprești o clipă. Dacă vrei, deschide când ai spațiu.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}