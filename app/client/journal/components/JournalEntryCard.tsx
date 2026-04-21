"use client";

import React from "react";
import { cn, toNiceDate, Visibility } from "./utils";

export type Entry = {
  id: number;
  createdAt: string;
  updatedAt?: string;
  title: string | null;
  content: string;
  tags: string[];
  visibility: Visibility;
  preparedForSession: boolean;
  preparedAt: string | null;
};

export default function JournalEntryCard({
  entry: e,
  onOpen,
  onToggleTag,
  onInfoShare,
}: {
  entry: Entry;
  onOpen: (e: Entry) => void;
  onToggleTag: (t: string) => void;
  onInfoShare: () => void;
}) {
  return (
    <article
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(252,249,251,0.98) 100%)",
      }}
      className={cn(
        "relative overflow-hidden rounded-[28px] border border-black/5 p-4 shadow-[0_12px_30px_rgba(31,23,32,0.06)] sm:rounded-4xl sm:p-6",
        e.visibility === "private"
          ? "before:absolute before:left-5 before:right-5 before:top-0 before:h-px before:bg-[linear-gradient(90deg,rgba(239,208,202,0.8),transparent)] before:content-['']"
          : "before:absolute before:left-5 before:right-5 before:top-0 before:h-px before:bg-[linear-gradient(90deg,rgba(125,128,218,0.75),transparent)] before:content-['']"
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-5">
        <div className="min-w-0">
          <h3 className="text-[1.12rem] font-semibold tracking-tight text-gray-900 sm:truncate">{e.title ?? "Un gând"}</h3>
          <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-gray-400">{toNiceDate(e.createdAt)}</p>
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 self-start rounded-[18px] border px-3 py-1 text-[10px] font-semibold tracking-widset shadow-[0_3px_8px_rgba(31,23,32,0.04)]",
            e.visibility === "private"
              ? "border-[#ead7df] bg-[#fff9fb] text-[#7d5d6c]"
              : "border-[#dcdcf8] bg-[#f5f4ff] text-[#676cc8]"
          )}
        >
          {e.visibility === "private" ? "Privat" : "Pentru ședință"}
        </span>
      </div>

      <p className="mt-4 line-clamp-4 text-[15px] leading-6 sm:mt-5 sm:leading-7 text-gray-800">{e.content}</p>

      <div className="mt-4 h-px w-full bg-[linear-gradient(90deg,rgba(31,23,32,0.08),transparent)] sm:mt-5" />

      <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <button
          type="button"
          onClick={() => onOpen(e)}
          className="inline-flex min-h-11 w-full sm:w-auto items-center justify-center rounded-[18px] border border-black/5 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-[0_5px_12px_rgba(31,23,32,0.05)] transition hover:bg-black/5"
        >
          Continuă
        </button>

        {e.visibility === "shared" ? (
          <button
            type="button"
            disabled={true}
            className="inline-flex min-h-11 w-full sm:w-auto cursor-not-allowed items-center justify-center rounded-[18px] border border-[rgba(239,135,192,0.28)] bg-[rgba(239,135,192,0.10)] px-3.5 py-2.5 text-[13px] font-semibold text-[rgba(190,90,150,0.92)] shadow-[0_4px_10px_rgba(239,135,192,0.12)] transition"
            onClick={onInfoShare}
          >
            Împărtășesc cu terapeutul
          </button>
        ) : null}
      </div>
    </article>
  );
}