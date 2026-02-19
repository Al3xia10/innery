"use client";

import * as React from "react";
import BreathTimer from "./BreathTimer";
import Sense54321 from "./Sense54321";
import RapidDump from "./RapidDump";

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

type Tab = "breath" | "sense" | "dump";

export default function GroundingDock() {
  const [open, setOpen] = React.useState(false);
  const [tab, setTab] = React.useState<Tab>("breath");

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Prevent background scroll when modal is open (incl. iOS Safari)
  React.useEffect(() => {
    if (typeof document === "undefined") return;

    const body = document.body;
    const html = document.documentElement;

    const prevBodyOverflow = body.style.overflow;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverscroll = (body.style as any).overscrollBehaviorY as string | undefined;
    const prevHtmlOverscroll = (html.style as any).overscrollBehaviorY as string | undefined;

    if (open) {
      body.style.overflow = "hidden";
      html.style.overflow = "hidden";
      // Helps prevent "rubber band" scroll chaining on mobile
      (body.style as any).overscrollBehaviorY = "contain";
      (html.style as any).overscrollBehaviorY = "contain";
    }

    return () => {
      body.style.overflow = prevBodyOverflow;
      html.style.overflow = prevHtmlOverflow;
      (body.style as any).overscrollBehaviorY = prevBodyOverscroll ?? "";
      (html.style as any).overscrollBehaviorY = prevHtmlOverscroll ?? "";
    };
  }, [open]);

  return (
    <>
      {/* FAB */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "fixed z-50 right-4 bottom-4 md:right-6 md:bottom-6",
          "group inline-flex items-center gap-2 rounded-full px-4 py-3 shadow-lg",
          "border border-white/60 bg-white/70 backdrop-blur-xl",
          "hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 transition",
          "text-sm font-semibold text-gray-900"
        )}
        style={{
          boxShadow:
            "0 12px 30px rgba(17,24,39,0.12), 0 2px 10px rgba(99,102,241,0.08)",
        }}
        aria-label="Când e prea mult"
      >
        <span
          className="inline-flex h-9 w-9 items-center justify-center rounded-full"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, rgba(99,102,241,0.25), rgba(236,72,153,0.16), rgba(255,255,255,0))",
          }}
        >
          🌿
        </span>
        <span className="hidden sm:inline">Când e prea mult</span>
        <span className="sm:hidden">Calmare</span>
      </button>

      {/* MODAL / SHEET */}
      {open ? (
        <div className="fixed inset-0 z-50">
          {/* overlay */}
          <button
            type="button"
            aria-label="Închide"
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* responsive container: bottom-sheet on mobile, centered modal on desktop */}
          <div className="absolute inset-0 flex items-end md:items-center justify-center p-3 sm:p-6">
            <div
              className={cn(
                "w-full",
                "max-w-3xl md:max-w-2xl",
                "rounded-3xl md:rounded-3xl",
                "border border-white/60 bg-white/80 backdrop-blur-xl shadow-2xl",
                "overflow-hidden",
                "max-h-[85svh]",
                "flex flex-col"
              )}
              role="dialog"
              aria-modal="true"
              aria-label="Când e prea mult"
            >
              {/* header */}
              <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 border-b border-white/50 bg-white/60 backdrop-blur-xl">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">Când e prea mult</p>
                    <p className="mt-1 text-sm text-gray-600">
                      Alege o variantă. 60 de secunde pot fi suficiente.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="shrink-0 rounded-xl border border-white/70 bg-white/70 px-3 py-2 text-sm font-semibold text-gray-800 shadow-sm hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition"
                  >
                    Închide
                  </button>
                </div>

                {/* tabs */}
                <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl border border-white/60 bg-white/70 p-2 shadow-sm">
                  <TabButton active={tab === "breath"} onClick={() => setTab("breath")}>
                    Respirație
                  </TabButton>
                  <TabButton active={tab === "sense"} onClick={() => setTab("sense")}>
                    5–4–3–2–1
                  </TabButton>
                  <TabButton active={tab === "dump"} onClick={() => setTab("dump")}>
                    Eliberare
                  </TabButton>
                </div>
              </div>

              {/* content (scrollable) */}
              <div className="flex-1 min-h-0 px-4 sm:px-6 py-4 sm:py-6 overflow-y-auto overscroll-contain">
                {tab === "breath" ? <BreathTimer /> : null}
                {tab === "sense" ? <Sense54321 /> : null}
                {tab === "dump" ? <RapidDump /> : null}
              </div>

              {/* footer */}
              <div className="px-4 sm:px-6 py-3 border-t border-white/50 bg-white/60 backdrop-blur-xl">
                <p className="text-xs text-gray-500">
                  Notă: dacă ai nevoie de ajutor imediat sau te simți în pericol, apelează serviciile locale
                  de urgență sau o persoană de încredere.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-xl px-3 py-2.5 text-xs sm:text-sm font-semibold transition",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70",
        active
          ? "bg-indigo-600 text-white shadow-sm"
          : "text-gray-700 hover:bg-white/80"
      )}
    >
      {children}
    </button>
  );
}