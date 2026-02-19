"use client";

import * as React from "react";
import { useLocalStorageState } from "./useLocalStorageState";

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

type Dump = {
  text: string;
  lastSavedAt: string | null;
  releasedAt: string | null;
};

const EMPTY: Dump = { text: "", lastSavedAt: null, releasedAt: null };

export default function RapidDump() {
  const [dump, setDump] = useLocalStorageState<Dump>("innery_grounding_dump", EMPTY);
  const [toast, setToast] = React.useState<string | null>(null);

  function onChange(v: string) {
    setDump({ text: v, lastSavedAt: new Date().toISOString(), releasedAt: null });
  }

  function release() {
    if (!dump.text.trim()) {
      setToast("Scrie 1–2 rânduri. Orice e suficient.");
      window.setTimeout(() => setToast(null), 1400);
      return;
    }
    setDump({ text: "", lastSavedAt: null, releasedAt: new Date().toISOString() });
    setToast("Ok. E suficient pentru acum.");
    window.setTimeout(() => setToast(null), 1600);
  }

  return (
    <div className="rounded-[28px] border border-white/60 bg-white/70 backdrop-blur-xl p-5 sm:p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-gray-900">Eliberare rapidă</p>
          <p className="mt-1 text-sm text-gray-600">
            Scrie tot ce e prea mult. Nu trebuie să aibă sens.
          </p>
        </div>
        <span className="text-xs text-gray-500">
          {dump.lastSavedAt ? "Se salvează automat" : " "}
        </span>
      </div>

      <textarea
        value={dump.text}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Scrie aici. 3 propoziții pot schimba tot."
        className="mt-4 w-full min-h-40 rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      <div className="mt-4 flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={release}
          className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition"
        >
          Eliberează
        </button>

        <button
          type="button"
          onClick={() => setDump(EMPTY)}
          className="inline-flex items-center justify-center rounded-xl border border-white/60 bg-white/70 px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-sm hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition"
        >
          Resetează
        </button>
      </div>

      {toast ? (
        <div
          className={cn(
            "mt-4 rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-sm text-gray-800 shadow-sm",
            "animate-[fadeIn_180ms_ease-out]"
          )}
        >
          {toast}
        </div>
      ) : null}

      {dump.releasedAt ? (
        <p className="mt-3 text-xs text-gray-500">
          Ultima eliberare: {new Date(dump.releasedAt).toLocaleString()}
        </p>
      ) : null}
    </div>
  );
}