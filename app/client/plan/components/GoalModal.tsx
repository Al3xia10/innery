"use client";

import * as React from "react";
import type { GoalStatus } from "../lib/goalTypes";
import { cn } from "../lib/goalTypes";

export default function GoalModal({
  open,
  editing,
  title,
  status,
  adding,
  onClose,
  onChangeTitle,
  onChangeStatus,
  onSave,
}: {
  open: boolean;
  editing: boolean;
  title: string;
  status: GoalStatus;
  adding: boolean;
  onClose: () => void;
  onChangeTitle: (v: string) => void;
  onChangeStatus: (s: GoalStatus) => void;
  onSave: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-2 sm:items-center sm:p-4">
      <button type="button" aria-label="Închide" onClick={onClose} className="absolute inset-0 bg-black/30" />

      <div className="relative w-full max-w-2xl overflow-hidden rounded-[28px] border border-white/60 bg-white/85 shadow-xl backdrop-blur-xl sm:rounded-4xl">
        <div
          className="px-4 py-4 sm:px-6"
          style={{
            background:
              "linear-gradient(135deg, #ffffff 0%, rgba(239,208,202,0.18) 60%, rgba(125,128,218,0.08) 100%)",
          }}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">{editing ? "Editează obiectiv" : "Obiectiv nou"}</p>
              <p className="mt-1 text-sm leading-6 text-(--color-foreground-muted,#6B5A63)">
                Setează titlul și statusul. Pașii pentru obiectiv vor fi generați automat.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-[18px] border border-black/5 bg-white text-foreground shadow-[0_4px_10px_rgba(31,23,32,0.05)] transition hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="px-4 py-4 sm:px-6 sm:py-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-(--color-foreground-muted,#6B5A63)">Titlu</label>
              <input
                value={title}
                onChange={(e) => onChangeTitle(e.target.value)}
                placeholder="Ex: Somn mai bun, 10 min plimbare, jurnal 3x/săpt."
                className="mt-2 w-full rounded-[18px] border border-white/60 bg-white/70 px-4 py-3 text-sm text-foreground shadow-sm outline-none focus:ring-2 focus:ring-(--color-accent)/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-(--color-foreground-muted,#6B5A63)">Status</label>
              <select
                value={status}
                onChange={(e) => onChangeStatus(e.target.value as GoalStatus)}
                className="mt-2 w-full rounded-[18px] border border-white/60 bg-white/70 px-4 py-3 text-sm text-foreground shadow-sm outline-none focus:ring-2 focus:ring-(--color-accent)/30"
              >
                <option value="Activ">Activ</option>
                <option value="În pauză">În pauză</option>
                <option value="Încheiat">Încheiat</option>
              </select>
            </div>
          </div>

          <div className="mt-4 sm:mt-5">
            <p className="text-xs font-semibold leading-5 text-(--color-foreground-muted,#6B5A63)">
              Pașii obiectivului vor fi generați automat de AI la salvare.
            </p>
            <p className="mt-2 text-xs leading-5 text-(--color-foreground-muted,#6B5A63)">
              Progressul se calculează automat din pașii bifați, nu manual.
            </p>
          </div>

          <div className="mt-5 flex flex-col gap-2.5 sm:mt-6 sm:flex-row sm:justify-end sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-11 w-full sm:w-auto items-center justify-center rounded-[18px] border border-black/5 bg-white px-4 py-2.5 text-sm font-semibold text-foreground shadow-[0_6px_14px_rgba(31,23,32,0.06)] transition hover:bg-[#fffafb]"
            >
              Anulează
            </button>

            <button
              type="button"
              onClick={onSave}
              disabled={adding}
              className={cn(
                "inline-flex min-h-11 w-full sm:w-auto items-center justify-center rounded-[18px] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition",
                adding
                  ? "bg-(--color-accent)/60 cursor-not-allowed"
                  : "bg-(--color-accent) shadow-[0_8px_18px_rgba(239,135,192,0.18)] hover:opacity-95"
              )}
            >
              {adding ? "Se salvează…" : editing ? "Salveaza" : "Creează"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
