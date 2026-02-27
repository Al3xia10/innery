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

  // ✅ Scroll lock (body)
  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;

    // avoid layout shift when scrollbar disappears
    const scrollbarW = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbarW > 0) document.body.style.paddingRight = `${scrollbarW}px`;

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-70 flex items-end sm:items-center justify-center p-3 sm:p-6">
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className="relative w-full max-w-xl rounded-[28px] border border-white/60 bg-white/80 backdrop-blur-xl shadow-xl"
      >
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
              {subtitle ? <p className="mt-1 text-sm text-gray-600">{subtitle}</p> : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/70 bg-white/70 px-3 py-2 text-sm font-semibold text-gray-800 shadow-sm hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition"
            >
              Închide
            </button>
          </div>

          <div className="mt-5">{children}</div>
        </div>
      </div>
    </div>
  );
}