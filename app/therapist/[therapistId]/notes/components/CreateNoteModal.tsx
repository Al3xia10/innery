"use client";

import * as React from "react";
import { XIcon } from "./NotesIcons";

type ClientOption = { id: string; name: string };
type SessionOption = { id: string; clientUserId: string; label: string };

export default function CreateNoteModal({
  open,
  loading,
  error,
  clients,
  clientId,
  sessions,
  sessionId,
  content,
  nowLabel,
  onClose,
  onChangeClientId,
  onChangeSessionId,
  onChangeContent,
  onConfirm,
}: {
  open: boolean;
  loading: boolean;
  error: string | null;
  clients: ClientOption[];
  clientId: string;
  sessions: SessionOption[];
  sessionId: string;
  content: string;
  nowLabel: string;
  onClose: () => void;
  onChangeClientId: (value: string) => void;
  onChangeSessionId: (value: string) => void;
  onChangeContent: (value: string) => void;
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
        className="mx-auto mt-24 w-[92%] max-w-lg overflow-hidden rounded-[28px] border border-black/5 bg-white shadow-[0_20px_48px_rgba(31,23,32,0.18)]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="border-b border-black/5 bg-[linear-gradient(135deg,#ffffff_0%,rgba(239,208,202,0.14)_65%,rgba(125,128,218,0.06)_100%)] px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="mt-3 text-[1.05rem] font-semibold text-gray-900">Notiță nouă</h3>
              <p className="mt-1 text-sm text-gray-600">Alege un client și o ședință, apoi scrie notița.</p>
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
              value={clientId}
              onChange={(e) => onChangeClientId(e.target.value)}
              className="mt-2 w-full rounded-xl border border-black/5 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-[0_4px_10px_rgba(31,23,32,0.03)] outline-none transition focus:border-(--color-soft)"
            >
              <option value="" disabled>
                {clients.length ? "Selectează un client" : "Nu există clienți conectați"}
              </option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-gray-500">Ședință</span>
            <select
              value={sessionId}
              onChange={(e) => onChangeSessionId(e.target.value)}
              className="mt-2 w-full rounded-xl border border-black/5 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-[0_4px_10px_rgba(31,23,32,0.03)] outline-none transition focus:border-(--color-soft)"
              disabled={!clientId}
            >
              <option value="" disabled>
                {clientId
                  ? sessions.length
                    ? "Selectează o ședință"
                    : "Nu există ședințe pentru acest client"
                  : "Selectează mai întâi un client"}
              </option>
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-gray-500">Notiță</span>
            <textarea
              value={content}
              onChange={(e) => onChangeContent(e.target.value)}
              placeholder={`Scrie notița… (${nowLabel})`}
              rows={6}
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
              disabled={loading}
            >
              Anulează
            </button>

            <button
              type="button"
              onClick={onConfirm}
              className="inline-flex items-center justify-center rounded-xl bg-(--color-accent) px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(184,104,152,0.22)] transition hover:opacity-95 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Se salvează…" : "Salvează notița"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
