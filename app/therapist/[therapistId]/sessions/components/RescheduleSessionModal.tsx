"use client";

import * as React from "react";
import { XIcon } from "./SessionsIcons";

export default function RescheduleSessionModal({
  open,
  clientName,
  draftDateLocal,
  onClose,
  onChangeDraftDateLocal,
  onConfirm,
}: {
  open: boolean;
  clientName: string;
  draftDateLocal: string;
  onClose: () => void;
  onChangeDraftDateLocal: (value: string) => void;
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
        className="mx-auto mt-24 w-[92%] max-w-lg overflow-hidden rounded-[30px] border border-black/5 bg-white shadow-[0_24px_60px_rgba(31,23,32,0.20)]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="border-b border-black/5 bg-[linear-gradient(135deg,#ffffff_0%,rgba(239,208,202,0.14)_65%,rgba(125,128,218,0.06)_100%)] px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="mt-3 text-[1.05rem] font-semibold text-gray-900">Reprogramează ședința</h3>
              <p className="mt-1 text-sm text-gray-600">
                Alege o nouă dată și oră pentru această ședință.
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
          <div className="text-sm text-gray-700">
            <div className="text-xs text-gray-500">Client</div>
            <div className="mt-1 font-semibold text-gray-900">{clientName}</div>
          </div>

          <label className="block">
            <span className="text-xs font-semibold text-gray-500">Dată nouă</span>
            <input
              type="datetime-local"
              value={draftDateLocal}
              onChange={(e) => onChangeDraftDateLocal(e.target.value)}
              className="mt-2 w-full rounded-xl border border-black/5 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-[0_4px_10px_rgba(31,23,32,0.03)] outline-none transition focus:border-(--color-soft)"
            />
          </label>

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
              className="inline-flex items-center justify-center rounded-xl bg-(--color-accent) px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(184,104,152,0.22)] transition hover:opacity-95"
            >
              Salvează
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
