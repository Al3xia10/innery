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
        "inline-flex snap-start items-center rounded-full border px-3 py-1.5 text-[11px] font-semibold tracking-[0.03em] shadow-[0_4px_10px_rgba(31,23,32,0.05)] transition",
        active
          ? "border-[#ead7df] bg-[#fff9fb] text-[#7d5d6c]"
          : "border-black/5 bg-white text-foreground hover:bg-[#fffafb]"
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
  const [searchOpen, setSearchOpen] = React.useState(false);

  return (
    <header
      className="overflow-hidden rounded-4xl border border-black/5 shadow-[0_10px_28px_rgba(31,23,32,0.05)]"
      style={{
        background:
          "linear-gradient(135deg, #ffffff 0%, rgba(239,208,202,0.18) 60%, rgba(125,128,218,0.08) 100%)",
      }}
    >
     <div className="mx-auto max-w-6xl space-y-8 px-6 py-8 lg:px-8">
        <div className="relative grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
          <div>
      
            <h1 className="mt-4 text-[2rem] font-semibold leading-[1.02] tracking-tight text-foreground sm:text-[2.55rem]">
              Jurnalul tău, în ritmul tău
            </h1>
            <p className="mt-3 max-w-2xl text-[15px] leading-8 text-(--color-foreground-muted,#6B5A63) sm:text-[17px]">
              Scrie ca să te auzi. Păstrează privat sau împărtășește cu terapeutul când simți.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center xl:justify-end xl:mt-4">
            <button
              type="button"
              onClick={openNewEntry}
              className="inline-flex w-full sm:w-auto items-center justify-center rounded-[18px] bg-(--color-accent) px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(239,135,192,0.18)] transition hover:opacity-95"
            >
              {tab === "private" ? "Scrie privat" : "Scrie pentru ședință"}
            </button>
            <Link
              href="/client"
              className="inline-flex w-full sm:w-auto items-center justify-center rounded-[18px] border border-black/5 bg-white px-4 py-2.5 text-sm font-semibold text-foreground shadow-[0_6px_14px_rgba(31,23,32,0.06)] transition hover:bg-[#fffafb]"
            >
              Înapoi la Azi
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="relative grid grid-cols-1 gap-4 xl:grid-cols-[auto_minmax(0,1fr)] xl:items-center">
          <div className="inline-flex w-full items-center rounded-full border border-(--color-soft) bg-background p-1 shadow-[0_6px_14px_rgba(31,23,32,0.06)] sm:w-auto">
            <button
              type="button"
              onClick={() => {
                setTab("private");
                setSelectedTag(null);
              }}
              className={cn(
                "flex-1 sm:flex-none rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition",
                tab === "private" ? "bg-(--color-accent) text-white shadow-[0_10px_20px_rgba(239,135,192,0.25)]" : "text-foreground bg-transparent hover:bg-(--color-card)"
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
                "flex-1 sm:flex-none rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition",
                tab === "shared" ? "bg-(--color-accent) text-white shadow-[0_10px_20px_rgba(239,135,192,0.25)]" : "text-foreground bg-transparent hover:bg-(--color-card)"
              )}
            >
              Pentru ședință
            </button>
          </div>

          <div className="text-xs leading-6 text-(--color-foreground-muted,#6B5A63) xl:pl-2">
            {tab === "private" ? (
              <span className="inline-flex items-center gap-2">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-black/5 bg-white text-[10px] opacity-90">
                  🔒
                </span>
                <span>Privat: doar tu vezi această notiță. Nimic nu se trimite fără acordul tău.</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-black/5 bg-white text-[10px] opacity-90">
                  🤝
                </span>
                <span>Pentru ședință: o poți păstra pentru terapie. Doar tu decizi ce împărtășești.</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}