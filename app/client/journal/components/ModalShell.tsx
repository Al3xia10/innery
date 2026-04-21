"use client";

import React, { useEffect, useRef } from "react";

export default function ModalShell({
  open,
  title,
  subtitle,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const first = panelRef.current?.querySelector<HTMLInputElement>("input, textarea, button");
    first?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div className="w-full">
      <div
        ref={panelRef}
        className="relative w-full overflow-hidden rounded-[28px] border border-black/5 bg-[linear-gradient(135deg,#ffffff_0%,rgba(239,208,202,0.12)_58%,rgba(125,128,218,0.06)_100%)] shadow-[0_18px_50px_rgba(31,23,32,0.08)] sm:rounded-4xl"
      >
        <div className="sticky top-0 z-10 border-b border-black/5 bg-[rgba(255,255,255,0.92)] backdrop-blur-md">
          <div className="flex flex-col gap-3 px-4 pb-4 pt-4 sm:flex-row sm:items-start sm:justify-between sm:px-7 sm:pb-5 sm:pt-6">
            <div className="min-w-0">
              <h2 className="text-[1.35rem] font-semibold leading-[1.08] tracking-tight text-[#1f1720] sm:text-[1.9rem]">
                {title}
              </h2>
              {subtitle ? (
                <p className="mt-2 max-w-2xl text-[15px] leading-6 sm:leading-7 text-[#6B5A63] sm:text-[17px]">
                  {subtitle}
                </p>
              ) : null}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="shrink-0 inline-flex min-h-10 items-center justify-center rounded-[18px] border border-black/5 bg-white px-4 py-2.5 text-sm font-semibold text-[#7d5d6c] shadow-[0_6px_14px_rgba(31,23,32,0.05)] transition hover:bg-black/5 sm:w-auto"
            >
              Închide
            </button>
          </div>
        </div>

        <div className="px-4 pb-4 pt-3 sm:px-7 sm:pb-7 sm:pt-5">
          <div className="rounded-[20px] border border-black/5 bg-white/82 p-4 shadow-[0_8px_20px_rgba(31,23,32,0.04)] sm:rounded-[28px] sm:p-5 md:p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}