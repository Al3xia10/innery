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
    <div className="group rounded-2xl border border-gray-100 bg-white p-3.5 shadow-sm transition hover:border-gray-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <label
            htmlFor={id}
            className="block text-[13px] font-semibold text-gray-900 cursor-pointer"
          >
            {label}
          </label>
          <p className="mt-1 text-xs text-gray-500 leading-relaxed">{description}</p>
        </div>

        <button
          id={id}
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={() => onChange(!checked)}
          className={[
            "relative inline-flex h-8 w-12.5 shrink-0 items-center rounded-full p-1 transition",
            "ring-1 ring-inset focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
            checked
              ? "bg-indigo-600 ring-indigo-600"
              : "bg-gray-200 ring-gray-200 group-hover:bg-gray-300",
          ].join(" ")}
        >
          <span className="pointer-events-none absolute -left-1 inline-flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className={["h-6 w-8 transition", checked ? "text-white/90" : "text-gray-500"].join(" ")}
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
              className={["h-3.5 w-3.5 transition", checked ? "text-white/70" : "text-gray-400"].join(" ")}
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
              "inline-flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm transition-transform",
              checked ? "translate-x-4.5" : "translate-x-0",
            ].join(" ")}
          >
            <span className={["h-2 w-2 rounded-full transition", checked ? "bg-indigo-600" : "bg-gray-300"].join(" ")} />
          </span>
        </button>
      </div>

      <div className="mt-2.5 flex items-center justify-between text-[11px] text-gray-500">
        <span className="inline-flex items-center gap-2">
          <span className={["h-1.5 w-1.5 rounded-full", checked ? "bg-indigo-500" : "bg-gray-300"].join(" ")} />
          {checked ? "Enabled" : "Disabled"}
        </span>
        <button
          type="button"
          onClick={() => onChange(!checked)}
          className="text-indigo-600 hover:text-indigo-700 font-semibold"
        >
          {checked ? "Turn off" : "Turn on"}
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
        className="rounded-3xl border border-black/5 shadow-sm p-6 space-y-5"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(224,231,255,0.7) 100%)",
        }}
      >
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Notifications</h2>
          <p className="mt-1 text-sm text-gray-600">Choose what you receive.</p>
        </div>

        <Toggle
          label="Email notifications"
          description="Get reminders and updates related to your therapy journey."
          checked={prefs.emailNotifications}
          onChange={(v) => update({ emailNotifications: v })}
        />

        <div className="h-px bg-gray-100" />

        <Toggle
          label="Session reminders"
          description="Receive a reminder before an upcoming session."
          checked={prefs.sessionReminders}
          onChange={(v) => update({ sessionReminders: v })}
        />
      </div>

      {/* PRIVACY */}
      <div
        className="rounded-3xl border border-black/5 shadow-sm p-6 space-y-5"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(224,231,255,0.7) 100%)",
        }}
      >
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Privacy & sharing</h2>
          <p className="mt-1 text-sm text-gray-600">You stay in control. Defaults can be changed any time.</p>
        </div>

        <Toggle
          label="Share reflections by default"
          description="When enabled, new reflections will be marked as shareable (you can still change per item later)."
          checked={prefs.shareReflectionsByDefault}
          onChange={(v) => update({ shareReflectionsByDefault: v })}
        />

        <div className="h-px bg-gray-100" />

        <Toggle
          label="Share notes by default"
          description="When enabled, new notes will be marked as shared with your therapist."
          checked={prefs.shareNotesByDefault}
          onChange={(v) => update({ shareNotesByDefault: v })}
        />
      </div>
    </>
  );
}