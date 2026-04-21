"use client";

import * as React from "react";
import { XIcon } from "./SessionsIcons";

type SessionType = "Individual" | "Couple" | "Group";
type ClientOption = { id: string; name: string };

export default function CreateSessionModal({
  open,
  loadingClients,
  clients,
  formClientId,
  formDateLocal,
  formDuration,
  formType,
  formSummary,
  creating,
  error,
  onClose,
  onFocusClients,
  onChangeClientId,
  onChangeDateLocal,
  onChangeDuration,
  onChangeType,
  onChangeSummary,
  onConfirm,
}: {
  open: boolean;
  loadingClients: boolean;
  clients: ClientOption[];
  formClientId: string;
  formDateLocal: string;
  formDuration: number;
  formType: SessionType;
  formSummary: string;
  creating: boolean;
  error: string | null;
  onClose: () => void;
  onFocusClients: () => void;
  onChangeClientId: (value: string) => void;
  onChangeDateLocal: (value: string) => void;
  onChangeDuration: (value: number) => void;
  onChangeType: (value: SessionType) => void;
  onChangeSummary: (value: string) => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onMouseDown={onClose}
    >
      <div
        className="mx-auto mt-20 w-[92%] max-w-xl overflow-hidden rounded-[30px] border border-black/5 bg-white shadow-[0_24px_60px_rgba(31,23,32,0.20)]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="border-b border-black/5 bg-[linear-gradient(135deg,#ffffff_0%,rgba(239,208,202,0.14)_65%,rgba(125,128,218,0.06)_100%)] px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="mt-3 text-[1.05rem] font-semibold text-gray-900">Ședință nouă</h3>
              <p className="mt-1 text-sm text-gray-600">
                Setează data, durata, tipul și un scurt rezumat privat.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-gray-500 transition hover:bg-gray-100"
              aria-label="Închide"
            >
              <XIcon />
            </button>
          </div>
        </div>

        <div className="space-y-4 px-6 py-5">
          <label className="block">
            <span className="text-xs font-semibold text-gray-500">Client</span>
            <select
              value={formClientId}
              onChange={(e) => onChangeClientId(e.target.value)}
              onFocus={onFocusClients}
              className="mt-2 w-full rounded-xl border border-black/5 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-[0_4px_10px_rgba(31,23,32,0.03)] outline-none transition focus:border-(--color-soft)"
            >
              {loadingClients ? (
                <option value="">Se încarcă…</option>
              ) : clients.length === 0 ? (
                <option value="">Nu există clienți conectați</option>
              ) : (
                clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))
              )}
            </select>
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold text-gray-500">Data și ora</span>
              <input
                type="datetime-local"
                value={formDateLocal}
                onChange={(e) => onChangeDateLocal(e.target.value)}
                className="mt-2 w-full rounded-xl border border-black/5 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-[0_4px_10px_rgba(31,23,32,0.03)] outline-none transition focus:border-(--color-soft)"
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-gray-500">Durată (min)</span>
              <input
                type="number"
                min={10}
                max={600}
                value={formDuration}
                onChange={(e) => onChangeDuration(Number(e.target.value))}
                className="mt-2 w-full rounded-xl border border-black/5 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-[0_4px_10px_rgba(31,23,32,0.03)] outline-none transition focus:border-(--color-soft)"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-xs font-semibold text-gray-500">Tip</span>
            <select
              value={formType}
              onChange={(e) => onChangeType(e.target.value as SessionType)}
              className="mt-2 w-full rounded-xl border border-black/5 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-[0_4px_10px_rgba(31,23,32,0.03)] outline-none transition focus:border-(--color-soft)"
            >
              <option value="Individual">Individuală</option>
              <option value="Couple">Cuplu</option>
              <option value="Group">Grup</option>
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-gray-500">Rezumat (opțional)</span>
            <textarea
              rows={3}
              value={formSummary}
              onChange={(e) => onChangeSummary(e.target.value)}
              placeholder="Rezumat privat scurt…"
              className="mt-2 w-full rounded-xl border border-black/5 bg-white p-3 text-sm text-gray-900 shadow-[0_4px_10px_rgba(31,23,32,0.03)] outline-none transition focus:border-(--color-soft)"
            />
          </label>

          {error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 shadow-[0_4px_12px_rgba(31,23,32,0.03)]">
              {error}
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-3 border-t border-black/5 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-xl border border-black/5 bg-(--color-card) px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-(--color-soft)"
            >
              Anulează
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={creating}
              className="inline-flex items-center justify-center rounded-xl bg-(--color-accent) px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(184,104,152,0.22)] transition hover:opacity-95 disabled:opacity-50"
            >
              {creating ? "Se creează…" : "Creează ședința"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
