"use client";

import * as React from "react";
import type { GoalStatus } from "../lib/goalTypes";
import { cn } from "../lib/goalTypes";

export default function GoalModal({
  open,
  editing,
  title,
  progress,
  status,
  adding,
  onClose,
  onChangeTitle,
  onChangeProgress,
  onChangeStatus,
  onSave,
}: {
  open: boolean;
  editing: boolean;
  title: string;
  progress: number;
  status: GoalStatus;
  adding: boolean;
  onClose: () => void;
  onChangeTitle: (v: string) => void;
  onChangeProgress: (n: number) => void;
  onChangeStatus: (s: GoalStatus) => void;
  onSave: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <button type="button" aria-label="Închide" onClick={onClose} className="absolute inset-0 bg-black/30" />

      <div className="relative w-full max-w-2xl rounded-[28px] border border-white/60 bg-white/85 backdrop-blur-xl shadow-xl overflow-hidden">
        <div
          className="px-5 sm:px-6 py-4"
          style={{
            background:
              "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(236,72,153,0.08), rgba(255,255,255,0.65))",
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">{editing ? "Editează obiectiv" : "Obiectiv nou"}</p>
              <p className="mt-1 text-sm text-gray-600">
                Setează titlul și un progres orientativ. Poți ajusta oricând.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="shrink-0 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/60 bg-white/70 text-gray-900 shadow-sm hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="px-5 sm:px-6 py-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700">Titlu</label>
              <input
                value={title}
                onChange={(e) => onChangeTitle(e.target.value)}
                placeholder="Ex: Somn mai bun, 10 min plimbare, jurnal 3x/săpt."
                className="mt-2 w-full rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-sm text-gray-900 shadow-sm outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700">Status</label>
              <select
                value={status}
                onChange={(e) => onChangeStatus(e.target.value as GoalStatus)}
                className="mt-2 w-full rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-sm text-gray-900 shadow-sm outline-none focus:ring-2 focus:ring-indigo-200"
              >
                <option value="Activ">Activ</option>
                <option value="În pauză">În pauză</option>
                <option value="Încheiat">Încheiat</option>
              </select>
            </div>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-700">Progres</label>
              <span className="text-xs font-semibold text-gray-900 tabular-nums">{progress}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={progress}
              onChange={(e) => onChangeProgress(Number(e.target.value))}
              className="mt-3 w-full"
            />
            <p className="mt-2 text-xs text-gray-500">
              Nu e „performanță”. E doar un reper ca să vezi dacă te apropii de ce îți dorești.
            </p>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-xl border border-white/60 bg-white/70 px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition"
            >
              Renunță
            </button>

            <button
              type="button"
              onClick={onSave}
              disabled={adding}
              className={cn(
                "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition",
                adding ? "bg-indigo-600/60 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
              )}
            >
              {adding ? "Se salvează…" : editing ? "Salvează" : "Creează"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}