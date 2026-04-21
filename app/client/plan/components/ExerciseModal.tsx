"use client";

import * as React from "react";

export default function ExerciseModal({
  open,
  title,
  kind,
  minutes,
  note,
  saving,
  onClose,
  onChangeTitle,
  onChangeKind,
  onChangeMinutes,
  onChangeNote,
  onSave,
}: {
  open: boolean;
  title: string;
  kind: "Exercițiu" | "Rutină";
  minutes: number;
  note: string;
  saving: boolean;
  onClose: () => void;
  onChangeTitle: (value: string) => void;
  onChangeKind: (value: "Exercițiu" | "Rutină") => void;
  onChangeMinutes: (value: number) => void;
  onChangeNote: (value: string) => void;
  onSave: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-[rgba(24,18,24,0.32)] px-3 backdrop-blur-sm sm:px-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-[28px] border border-black/5 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(255,250,251,0.96)_100%)] shadow-[0_24px_60px_rgba(31,23,32,0.16)] sm:rounded-4xl">
        <div className="flex items-start justify-between gap-4 border-b border-black/5 px-4 py-4 sm:px-7 sm:py-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8a7b84]">
              Exercițiu nou
            </p>
            <h2 className="mt-2 text-[1.45rem] font-semibold tracking-tight text-foreground sm:text-[1.7rem]">
              Adaugă un exercițiu
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#74656d] sm:leading-7">
              Creează un exercițiu sau o rutină pe care vrei să o urmezi în perioada asta.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[18px] border border-black/5 bg-white text-lg text-[#7d5d6c] shadow-[0_4px_10px_rgba(31,23,32,0.04)] transition hover:bg-[#fff7fa]"
            aria-label="Închide"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 px-4 py-5 sm:grid-cols-2 sm:px-7 sm:py-6">
          <label className="flex flex-col gap-2 sm:col-span-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8a7b84]">
              Titlu
            </span>
            <input
              value={title}
              onChange={(e) => onChangeTitle(e.target.value)}
              className="rounded-[18px] border border-black/5 bg-white px-4 py-3 text-sm text-foreground shadow-[0_4px_10px_rgba(31,23,32,0.03)] outline-none transition focus:border-[#e7bfd2] focus:ring-2 focus:ring-[#f6dce9]"
              placeholder="De ex. Respirație 4-7-8"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8a7b84]">
              Tip
            </span>
            <select
              value={kind}
              onChange={(e) => onChangeKind(e.target.value as "Exercițiu" | "Rutină")}
              className="rounded-[18px] border border-black/5 bg-white px-4 py-3 text-sm text-foreground shadow-[0_4px_10px_rgba(31,23,32,0.03)] outline-none transition focus:border-[#e7bfd2] focus:ring-2 focus:ring-[#f6dce9]"
            >
              <option value="Exercițiu">Exercițiu</option>
              <option value="Rutină">Rutină</option>
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8a7b84]">
              Minute
            </span>
            <input
              type="number"
              min={1}
              value={minutes}
              onChange={(e) => onChangeMinutes(Number(e.target.value) || 0)}
              className="rounded-[18px] border border-black/5 bg-white px-4 py-3 text-sm text-foreground shadow-[0_4px_10px_rgba(31,23,32,0.03)] outline-none transition focus:border-[#e7bfd2] focus:ring-2 focus:ring-[#f6dce9]"
            />
          </label>

          <label className="flex flex-col gap-2 sm:col-span-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8a7b84]">
              Notiță
            </span>
            <textarea
              value={note}
              onChange={(e) => onChangeNote(e.target.value)}
              rows={4}
              className="rounded-[18px] border border-black/5 bg-white px-4 py-3 text-sm text-foreground shadow-[0_4px_10px_rgba(31,23,32,0.03)] outline-none transition focus:border-[#e7bfd2] focus:ring-2 focus:ring-[#f6dce9]"
              placeholder="De ex. Dimineața, după cafea."
            />
          </label>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-black/5 px-4 py-4 sm:flex-row sm:justify-end sm:px-7 sm:py-5">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-[18px] border border-black/5 bg-white px-5 py-2.5 text-sm font-semibold text-foreground shadow-[0_6px_14px_rgba(31,23,32,0.05)] transition hover:bg-[#fffafb] sm:w-auto"
          >
            Anulează
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-[18px] bg-(--color-accent) px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(239,135,192,0.25)] transition hover:opacity-90 disabled:opacity-50 sm:w-auto"
          >
            {saving ? "Se salvează..." : "Salvează exercițiul"}
          </button>
        </div>
      </div>
    </div>
  );
}
