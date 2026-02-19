"use client";

import * as React from "react";

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export default function BreathTimer() {
  // 4-2-6 breathing (inhale 4, hold 2, exhale 6) – calm & safe
  const phases = React.useMemo(
    () => [
      { key: "in", label: "Inspiră", seconds: 4 },
      { key: "hold", label: "Ține", seconds: 2 },
      { key: "out", label: "Expiră", seconds: 6 },
    ],
    []
  );

  const total = phases.reduce((a, p) => a + p.seconds, 0);

  const [running, setRunning] = React.useState(false);
  const [remaining, setRemaining] = React.useState(60); // total session
  const [phaseIndex, setPhaseIndex] = React.useState(0);
  const [phaseLeft, setPhaseLeft] = React.useState(phases[0].seconds);

  React.useEffect(() => {
    if (!running) return;

    const t = setInterval(() => {
      setRemaining((r) => Math.max(0, r - 1));
      setPhaseLeft((p) => Math.max(0, p - 1));
    }, 1000);

    return () => clearInterval(t);
  }, [running]);

  React.useEffect(() => {
    if (!running) return;

    // phase tick
    if (phaseLeft === 0) {
      setPhaseIndex((i) => {
        const next = (i + 1) % phases.length;
        setPhaseLeft(phases[next].seconds);
        return next;
      });
    }
  }, [phaseLeft, running, phases]);

  React.useEffect(() => {
    if (!running) return;
    if (remaining === 0) {
      setRunning(false);
    }
  }, [remaining, running]);

  const phase = phases[phaseIndex];

  const progress = remaining / 60;
  const phaseProgress = phaseLeft / phase.seconds;

  return (
    <div className="rounded-[28px] border border-white/60 bg-white/70 backdrop-blur-xl p-5 sm:p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-gray-900">Respirație ghidată (60 sec)</p>
          <p className="mt-1 text-sm text-gray-600">
            Urmează cercul. E suficient să fii aici acum.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setRunning(false);
            setRemaining(60);
            setPhaseIndex(0);
            setPhaseLeft(phases[0].seconds);
          }}
          className="rounded-xl border border-white/70 bg-white/70 px-3 py-2 text-xs font-semibold text-gray-800 shadow-sm hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition"
        >
          Resetează
        </button>
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Circle */}
        <div className="relative flex items-center justify-center">
          <div
            className={cn(
              "h-44 w-44 sm:h-48 sm:w-48 rounded-full border border-white/70 bg-white/60 shadow-inner",
              running ? "animate-[pulse_2.6s_ease-in-out_infinite]" : ""
            )}
          />
          <div
            className={cn(
              "absolute h-44 w-44 sm:h-48 sm:w-48 rounded-full",
              phase.key === "in"
                ? "scale-105"
                : phase.key === "out"
                ? "scale-95"
                : "scale-100",
              "transition-transform duration-700 ease-out"
            )}
            style={{
              background:
                "radial-gradient(circle at 30% 30%, rgba(99,102,241,0.22), rgba(236,72,153,0.12), rgba(255,255,255,0))",
            }}
          />
          <div className="absolute text-center">
            <p className="text-xs font-semibold text-gray-600">{phase.label}</p>
            <p className="mt-1 text-3xl font-semibold text-gray-900 tabular-nums">
              {phaseLeft}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {running ? "Continuă…" : "Apasă start"}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col justify-between">
          <div className="rounded-2xl border border-white/60 bg-white/70 p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Timp rămas</span>
              <span className="tabular-nums font-semibold text-gray-900">{remaining}s</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-white/60 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.round(progress * 100)}%`,
                  background:
                    "linear-gradient(90deg, rgba(99,102,241,0.65), rgba(236,72,153,0.45))",
                }}
              />
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-gray-600">
              <span>Faza curentă</span>
              <span className="font-semibold text-gray-900">{phase.label}</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-white/60 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.round(phaseProgress * 100)}%`,
                  background:
                    "linear-gradient(90deg, rgba(17,24,39,0.25), rgba(99,102,241,0.45))",
                }}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => setRunning(true)}
              disabled={running || remaining === 0}
              className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition disabled:opacity-50"
            >
              Start
            </button>
            <button
              type="button"
              onClick={() => setRunning(false)}
              disabled={!running}
              className="inline-flex items-center justify-center rounded-xl border border-white/60 bg-white/70 px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-sm hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition disabled:opacity-50"
            >
              Pauză
            </button>
          </div>

          <p className="mt-4 text-xs text-gray-500">
            Tip: dacă îți vine să grăbești, e ok. Revino blând la ritm.
          </p>
        </div>
      </div>
    </div>
  );
}