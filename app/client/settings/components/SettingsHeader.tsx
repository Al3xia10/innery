"use client";

import * as React from "react";
import Link from "next/link";

export function SettingsHeader() {
  return (
    <header>
      <div
        className="rounded-4xl border border-black/5 shadow-sm overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(224,231,255,0.7) 100%)",
        }}
      >
        <div className="px-6 py-7 sm:px-10 sm:py-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-indigo-700 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                Setarile tale
              </div>

            <h1 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">
              Setari
            </h1>
            <p className="mt-1 text-sm text-gray-600 max-w-xl">
              Gestionează profilul, notificările și preferințele de confidențialitate.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/client"
              className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white/70 px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition"
            >
              Înapoi la dashboard
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}