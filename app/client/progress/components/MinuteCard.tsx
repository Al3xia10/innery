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
          "linear-gradient(135deg, #ffffff 0%, rgba(239,208,202,0.18) 60%, rgba(125,128,218,0.08) 100%)",
      }}
    >
      <div className="flex items-center justify-between gap-3 p-6 sm:p-7">
        <div>
          <p className="text-sm font-semibold text-foreground">Un minut pentru tine</p>
          <p className="mt-1 text-sm text-(--color-foreground-muted,#6B5A63)">Opțional — doar dacă ai spațiu acum.</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="shrink-0 inline-flex items-center justify-center rounded-xl border border-black/5 bg-(--color-card) px-3 py-2 text-sm font-semibold text-foreground shadow-[0_4px_10px_rgba(31,23,32,0.05)] hover:bg-(--color-soft) transition"
        >
          {open ? "Ascunde" : "Deschide"}
        </button>
      </div>

      {open ? (
        <div className="px-6 pb-6 sm:px-7 sm:pb-7">
          <div className="rounded-2xl border border-black/5 bg-(--color-card) p-5">
            <p className="text-sm text-foreground">
              Dacă vrei: inspiră 4 secunde, ține 4, expiră 6 — de 3 ori.
            </p>
            <p className="mt-2 text-sm text-foreground">Apoi: „de ce am nevoie acum?”</p>
            <p className="mt-3 text-xs text-(--color-foreground-muted,#6B5A63)">
              O zi grea nu „strică” nimic. E doar o zi — iar tu ești mai mult decât un grafic.
            </p>
            <div className="mt-4">
              <Link
                href="/client/journal"
                className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-(--color-accent) px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-95 transition"
              >
                Scriu un rând
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="px-6 pb-6 sm:px-7 sm:pb-7">
          <div className="rounded-2xl border border-black/5 bg-(--color-card) p-4">
            <p className="text-sm text-foreground">
              Uneori e suficient să te oprești o clipă. Dacă vrei, deschide când ai spațiu.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}