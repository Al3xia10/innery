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
          "linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(224,231,255,0.7) 100%)",
      }}
      className={cn(
        "relative overflow-hidden rounded-3xl border border-black/5 p-6 shadow-sm",
        e.visibility === "private"
          ? "before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-linear-to-b before:from-gray-300 before:to-transparent before:content-['']"
          : "before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-linear-to-b before:from-indigo-400 before:to-transparent before:content-['']"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-gray-900 truncate">{e.title ?? "Un gând"}</h3>
          <p className="mt-1 text-xs text-gray-500">{toNiceDate(e.createdAt)}</p>
        </div>
        <span
          className={cn(
            "rounded-full border px-2.5 py-1 text-xs font-semibold shadow-sm",
            e.visibility === "private"
              ? "border-gray-100 bg-gray-50 text-gray-800"
              : "border-indigo-100 bg-indigo-50 text-indigo-800"
          )}
        >
          {e.visibility === "private" ? "Privat" : "Pentru ședință"}
        </span>
      </div>

      <p className="mt-4 text-sm text-gray-700 leading-relaxed line-clamp-5">{e.content}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {e.tags.length === 0 ? (
          <span className="text-xs text-gray-400">fără tag-uri</span>
        ) : (
          e.tags.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onToggleTag(t)}
              className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition"
            >
              #{t}
            </button>
          ))
        )}
      </div>

      <div className="mt-5 flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={() => onOpen(e)}
          className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50 transition"
        >
          Continuă
        </button>

        {e.visibility === "shared" ? (
          <button
            type="button"
            disabled={true}
            className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition opacity-50 cursor-not-allowed"
            onClick={onInfoShare}
          >
            Împărtășesc cu terapeutul
          </button>
        ) : null}
      </div>
    </article>
  );
}