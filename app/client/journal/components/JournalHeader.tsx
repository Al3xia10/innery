"use client";

import React from "react";
import Link from "next/link";
import { cn, Visibility } from "./utils";

function TagChip({ tag, active, onClick }: { tag: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex snap-start items-center rounded-full border px-3 py-1 text-xs font-semibold shadow-sm transition",
        active
          ? "border-indigo-200 bg-indigo-50 text-indigo-800"
          : "border-white/60 bg-white/70 text-gray-700 hover:bg-white hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
      )}
    >
      {tag === "all" ? "Toate" : `#${tag}`}
    </button>
  );
}

export default function JournalHeader({
  tab,
  setTab,
  setSelectedTag,
  query,
  setQuery,
  allTags,
  selectedTag,
  openNewEntry,
}: {
  tab: Visibility;
  setTab: (v: Visibility) => void;
  setSelectedTag: React.Dispatch<React.SetStateAction<string | null>>;
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  allTags: string[];
  selectedTag: string | null;
  openNewEntry: () => void;
}) {
  return (
    <header className="rounded-4xl border border-white/60 bg-white/70 backdrop-blur-xl shadow-sm overflow-hidden">
      <div className="relative px-6 py-7 sm:px-10 sm:py-10">
        <div className="absolute inset-0 bg-linear-to-br from-white/50 to-white/10" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-3 py-1 text-xs font-semibold text-gray-700 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              Spațiul tău de jurnal
            </div>
            <h1 className="mt-3 text-2xl sm:text-3xl font-semibold text-gray-900">
              Jurnalul tău, în ritmul tău
            </h1>
            <p className="mt-2 text-sm text-gray-600 max-w-2xl">
              Scrie ca să te auzi. Păstrează privat sau împărtășește cu terapeutul când simți.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <button
              type="button"
              onClick={openNewEntry}
              className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition"
            >
              Scrie în jurnal
            </button>
            <Link
              href="/client"
              className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl border border-white/60 bg-white/70 px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-sm hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition"
            >
              Înapoi la Azi
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="relative mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="inline-flex items-center rounded-full border border-white/60 bg-white/70 backdrop-blur p-1 shadow-sm w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                setTab("private");
                setSelectedTag(null);
              }}
              className={cn(
                "flex-1 sm:flex-none rounded-full px-3 py-2 text-xs font-semibold transition",
                tab === "private" ? "bg-indigo-600 text-white shadow-sm" : "text-gray-700 hover:bg-white"
              )}
            >
              Privat
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("shared");
                setSelectedTag(null);
              }}
              className={cn(
                "flex-1 sm:flex-none rounded-full px-3 py-2 text-xs font-semibold transition",
                tab === "shared" ? "bg-indigo-600 text-white shadow-sm" : "text-gray-700 hover:bg-white"
              )}
            >
              Pentru ședință
            </button>
          </div>

          <div className="text-xs text-gray-600">
            {tab === "private" ? (
              <span>Privat: doar pentru tine. Nimeni nu vede fără acordul tău.</span>
            ) : (
              <span>
                Pentru ședință: note pe care alegi să le împărtășești. Doar tu decizi. Nimic nu se trimite automat.
              </span>
            )}
          </div>
        </div>

        {/* SEARCH & TAGS */}
        <div className="relative mt-4 flex flex-col gap-3">
          <div className="relative w-full sm:max-w-md">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Caută în jurnal…"
              className="w-full rounded-full border border-white/60 bg-white/80 pl-5 pr-12 py-3 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Caută în jurnal"
            />
            {query.trim() ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-white/80 text-gray-600 shadow-sm hover:bg-white transition"
                aria-label="Golește căutarea"
                title="Golește"
              >
                ✕
              </button>
            ) : null}
          </div>

          {/* tags */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 snap-x snap-mandatory">
            {allTags.length === 0 ? (
              <span className="text-xs text-gray-500 whitespace-nowrap">
                Tag-urile apar după ce adaugi câteva note.
              </span>
            ) : (
              <>
                <TagChip tag="all" active={selectedTag == null} onClick={() => setSelectedTag(null)} />
                {allTags.map((t) => (
                  <TagChip
                    key={t}
                    tag={t}
                    active={selectedTag === t}
                    onClick={() => setSelectedTag((prev) => (prev === t ? null : t))}
                  />
                ))}
                {allTags.length > 7 ? (
                  <span className="ml-2 text-xs text-gray-500 whitespace-nowrap snap-start">
                    derulează pentru mai multe tag-uri →
                  </span>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}