"use client";

import * as React from "react";
import type { ClientPrefs } from "../hooks/useClientPrefs";

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  const id = React.useId();

  return (
    <div className="group rounded-3xl border border-black/5 bg-white/90 p-4 shadow-[0_6px_14px_rgba(31,23,32,0.04)] transition hover:bg-[#fffafb] hover:shadow-[0_10px_20px_rgba(31,23,32,0.06)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <label
            htmlFor={id}
            className="block cursor-pointer text-[13px] font-semibold text-foreground"
          >
            {label}
          </label>
          <p className="mt-1 text-xs leading-relaxed text-[#74656d]">{description}</p>
        </div>

        <button
          id={id}
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={() => onChange(!checked)}
          className={[
            "relative inline-flex h-7 w-11 shrink-0 items-center rounded-full p-1 transition",
            "ring-1 ring-inset focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c7d9] focus-visible:ring-offset-2",
            checked
              ? "bg-(--color-accent) ring-(--color-accent)"
              : "bg-[#eadfe5] ring-[#eadfe5] group-hover:bg-[#e4d6de]",
          ].join(" ")}
        >
          <span className="pointer-events-none absolute -left-1 inline-flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className={["h-6 w-8 transition", checked ? "text-white/90" : "text-[#8a7b84]"].join(" ")}
              aria-hidden="true"
            >
              <path
                d="M9 12.75 11.25 15 15 9.75"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="pointer-events-none absolute right-2 inline-flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className={["h-3.5 w-3.5 transition", checked ? "text-white/70" : "text-[#b8aab2]"].join(" ")}
              aria-hidden="true"
            >
              <path
                d="M6 18 18 6M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>

          <span
            className={[
              "inline-flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm transition-transform",
              checked ? "translate-x-4.5" : "translate-x-0",
            ].join(" ")}
          >
            <span className={["h-2 w-2 rounded-full transition", checked ? "bg-(--color-accent)" : "bg-[#d9ccd4]"].join(" ")} />
          </span>
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-[#8a7b84]">
        <span className="inline-flex items-center gap-2">
          <span className={["h-1.5 w-1.5 rounded-full", checked ? "bg-(--color-accent)" : "bg-[#d7cad2]"].join(" ")} />
          {checked ? "Activ" : "Oprit"}
        </span>
        <button
          type="button"
          onClick={() => onChange(!checked)}
          className="font-semibold text-[#7d5d6c] transition hover:text-foreground"
        >
          {checked ? "Dezactivează" : "Activează"}
        </button>
      </div>
    </div>
  );
}


export function PreferencesSection({
  prefs,
  update,
  onToast,
}: {
  prefs: ClientPrefs;
  update: (next: Partial<ClientPrefs>) => Promise<void>;
  onToast?: (msg: string) => void;
}) {
  return (
    <>
      {/* NOTIFICATIONS */}
      <div
        className="rounded-[28px] border border-black/5 p-6 space-y-5 shadow-[0_10px_24px_rgba(31,23,32,0.05)]"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,250,251,0.95) 100%)",
        }}
      >
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8a7b84]">
            Ritmul tău
          </p>
          <h2 className="mt-2 text-[1.2rem] font-semibold tracking-tight text-foreground">
            Notificări & remindere
          </h2>
          <p className="mt-2 text-sm leading-7 text-[#74656d]">
            Alege cum vrei să rămâi conectată la ședințe și la parcursul tău.
          </p>
        </div>

        <Toggle
          label="Notificări pe email"
          description="Primești remindere și actualizări despre parcursul tău."
          checked={prefs.emailNotifications}
          onChange={(v) => update({ emailNotifications: v })}
        />

        <div className="h-px bg-[linear-gradient(90deg,rgba(239,208,202,0.4),transparent)]" />

        <Toggle
          label="Remindere pentru ședințe"
          description="Primești o notificare înainte de o ședință programată."
          checked={prefs.sessionReminders}
          onChange={(v) => update({ sessionReminders: v })}
        />
      </div>

      {/* PRIVACY */}
      <div
        className="rounded-[28px] border border-black/5 p-6 space-y-5 shadow-[0_10px_24px_rgba(31,23,32,0.05)]"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,250,251,0.95) 100%)",
        }}
      >
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8a7b84]">
            Spațiul tău personal
          </p>
          <h2 className="mt-2 text-[1.2rem] font-semibold tracking-tight text-foreground">
            Confidențialitate & partajare
          </h2>
          <p className="mt-2 text-sm leading-7 text-[#74656d]">
            Tu decizi ce rămâne privat și ce poate fi împărtășit mai departe.
          </p>
        </div>

        <Toggle
          label="Partajează reflecțiile implicit"
          description="Reflecțiile noi vor fi partajabile implicit."
          checked={prefs.shareReflectionsByDefault}
          onChange={(v) => update({ shareReflectionsByDefault: v })}
        />

        <div className="h-px bg-[linear-gradient(90deg,rgba(239,208,202,0.75),transparent)]" />

        <Toggle
          label="Partajează notițele implicit"
          description="Noile notițe vor fi partajate automat cu terapeutul."
          checked={prefs.shareNotesByDefault}
          onChange={(v) => update({ shareNotesByDefault: v })}
        />
      </div>
    </>
  );
}