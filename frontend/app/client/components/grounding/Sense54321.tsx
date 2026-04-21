"use client";

import * as React from "react";
import { useLocalStorageState } from "./useLocalStorageState";

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

type Answers = {
  see: string[];
  touch: string[];
  hear: string[];
  smell: string[];
  taste: string[];
};

const EMPTY: Answers = {
  see: ["", "", "", "", ""],
  touch: ["", "", "", ""],
  hear: ["", "", ""],
  smell: ["", ""],
  taste: [""],
};

export default function Sense54321() {
  const [answers, setAnswers] = useLocalStorageState<Answers>(
    "innery_grounding_54321",
    EMPTY
  );

  const [savedPulse, setSavedPulse] = React.useState(false);

  function setField(group: keyof Answers, idx: number, value: string) {
    setAnswers((prev) => {
      const next = { ...prev, [group]: [...prev[group]] };
      next[group][idx] = value;
      return next;
    });
    setSavedPulse(true);
    window.setTimeout(() => setSavedPulse(false), 450);
  }

  function reset() {
    setAnswers(EMPTY);
  }

  return (
    <div className="rounded-[28px] border border-white/60 bg-white/70 backdrop-blur-xl p-5 sm:p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-gray-900">5–4–3–2–1 (ancorare)</p>
          <p className="mt-1 text-sm text-gray-600">
            Îți aduce atenția în prezent, fără efort.
          </p>
        </div>
        <button
          type="button"
          onClick={reset}
          className="rounded-xl border border-white/70 bg-white/70 px-3 py-2 text-xs font-semibold text-gray-800 shadow-sm hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition"
        >
          Resetează
        </button>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition",
            savedPulse ? "border-indigo-200 bg-indigo-50 text-indigo-800" : "border-white/60 bg-white/70 text-gray-700"
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", savedPulse ? "bg-indigo-600" : "bg-gray-300")} />
          Se salvează automat
        </span>
        <span className="text-xs text-gray-500">rămâne salvat dacă dai refresh</span>
      </div>

      <div className="mt-5 space-y-5">
        <Block
          title="5 lucruri pe care le vezi"
          items={answers.see}
          onChange={(i, v) => setField("see", i, v)}
        />
        <Block
          title="4 lucruri pe care le simți (atingere)"
          items={answers.touch}
          onChange={(i, v) => setField("touch", i, v)}
        />
        <Block
          title="3 lucruri pe care le auzi"
          items={answers.hear}
          onChange={(i, v) => setField("hear", i, v)}
        />
        <Block
          title="2 lucruri pe care le miroși"
          items={answers.smell}
          onChange={(i, v) => setField("smell", i, v)}
        />
        <Block
          title="1 lucru pe care îl guști"
          items={answers.taste}
          onChange={(i, v) => setField("taste", i, v)}
        />
      </div>
    </div>
  );
}

function Block({
  title,
  items,
  onChange,
}: {
  title: string;
  items: string[];
  onChange: (idx: number, value: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/60 p-4 shadow-sm">
      <p className="text-xs font-semibold text-gray-700">{title}</p>
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((v, i) => (
          <input
            key={i}
            value={v}
            onChange={(e) => onChange(i, e.target.value)}
            placeholder={`${i + 1}.`}
            className="w-full rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        ))}
      </div>
    </div>
  );
}