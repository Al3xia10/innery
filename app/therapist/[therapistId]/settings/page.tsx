"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { therapists } from "@/app/_mock/data";
import { getTherapistProfile, setTherapistProfile } from "@/app/_lib/profile";

type TherapistPrefs = {
  emailNotifications: boolean;
  weeklySummary: boolean;
  newClientAlerts: boolean;
  noteReminders: boolean;
};

type TherapistProfileOverride = {
  name: string;
  email: string;
};

function storageKey(therapistId: string) {
  return `innery_therapist_prefs_${therapistId}`;
}

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}


function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "?";
  const b = (parts.length > 1 ? parts[parts.length - 1]?.[0] : "") ?? "";
  return (a + b).toUpperCase();
}

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
    <div className="group rounded-2xl border border-gray-100 bg-white p-3 shadow-sm transition hover:border-gray-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <label
            htmlFor={id}
            className="block text-[13px] font-semibold text-gray-900 cursor-pointer"
          >
            {label}
          </label>
          <p className="mt-1 text-xs text-gray-500 leading-relaxed">
            {description}
          </p>
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
          {/* Track icons */}
          <span className="pointer-events-none absolute -left-1 inline-flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className={[
                "h-6 w-8 transition",
                checked ? "text-white/90" : "text-gray-500",
              ].join(" ")}
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
              className={[
                "h-3.5 w-3.5 transition",
                checked ? "text-white/70" : "text-gray-400",
              ].join(" ")}
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

          {/* Thumb */}
          <span
            className={[
              "inline-flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm transition-transform",
              checked ? "translate-x-4.5" : "translate-x-0",
            ].join(" ")}
          >
            <span
              className={[
                "h-2 w-2 rounded-full transition",
                checked ? "bg-indigo-600" : "bg-gray-300",
              ].join(" ")}
            />
          </span>
        </button>
      </div>

      <div className="mt-2.5 flex items-center justify-between text-[11px] text-gray-500">
        <span className="inline-flex items-center gap-2">
          <span
            className={[
              "h-1.5 w-1.5 rounded-full",
              checked ? "bg-indigo-500" : "bg-gray-300",
            ].join(" ")}
          />
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

export default function TherapistSettingsPage() {
  const params = useParams<{ therapistId: string }>();
  const therapistId = params?.therapistId ?? "";

  const therapist = React.useMemo(
    () => therapists.find((t) => t.id === therapistId),
    [therapistId]
  );

  const [profile, setProfile] = React.useState<TherapistProfileOverride | null>(null);
  const [editingProfile, setEditingProfile] = React.useState(false);
  const [draftName, setDraftName] = React.useState("");
  const [draftEmail, setDraftEmail] = React.useState("");
  const [profileSaving, setProfileSaving] = React.useState(false);

  const defaultPrefs: TherapistPrefs = React.useMemo(
    () => ({
      emailNotifications: true,
      weeklySummary: true,
      newClientAlerts: true,
      noteReminders: false,
    }),
    []
  );

  const [hydrated, setHydrated] = React.useState(false);
  const [prefs, setPrefs] = React.useState<TherapistPrefs>(defaultPrefs);
  const [toast, setToast] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!therapistId) return;
    const existing = safeParse<TherapistPrefs>(localStorage.getItem(storageKey(therapistId)));

    if (existing) {
      setPrefs({
        emailNotifications: !!existing.emailNotifications,
        weeklySummary: !!existing.weeklySummary,
        newClientAlerts: !!existing.newClientAlerts,
        noteReminders: !!existing.noteReminders,
      });
    } else {
      localStorage.setItem(storageKey(therapistId), JSON.stringify(defaultPrefs));
      setPrefs(defaultPrefs);
    }

    setHydrated(true);
  }, [therapistId, defaultPrefs]);

  // Hydrate profile override from localStorage
  React.useEffect(() => {
    if (!therapistId || !therapist) return;

    const fallbackEmail = (therapist as any).email ?? "therapist@innery.com";
    const next = getTherapistProfile(therapistId, therapist.name, fallbackEmail);

    setProfile(next);
    setDraftName(next.name);
    setDraftEmail(next.email);
  }, [therapistId, therapist]);

  React.useEffect(() => {
    if (!hydrated || !therapistId) return;
    localStorage.setItem(storageKey(therapistId), JSON.stringify(prefs));
  }, [prefs, hydrated, therapistId]);

  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  function update(next: Partial<TherapistPrefs>) {
    setPrefs((p) => ({ ...p, ...next }));
    setToast("Saved");
  }

  function openProfileEdit() {
    if (!profile) return;
    setEditingProfile(true);
    setDraftName(profile.name);
    setDraftEmail(profile.email);
  }

  function cancelProfileEdit() {
    if (!profile) return;
    setEditingProfile(false);
    setDraftName(profile.name);
    setDraftEmail(profile.email);
  }

  async function saveProfileEdit() {
    if (!therapistId || !profile) return;

    const name = draftName.trim();
    const email = draftEmail.trim();

    if (!name || !email) {
      setToast("Please fill name + email");
      return;
    }

    setProfileSaving(true);
    await new Promise((r) => setTimeout(r, 250));

    const next = { name, email };
    setProfile(next);
    setTherapistProfile(therapistId, next);

    setEditingProfile(false);
    setProfileSaving(false);
    setToast("Saved");
  }

  if (!therapist) {
    return (
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
          <h1 className="text-base font-semibold text-gray-900">Therapist not found</h1>
          <p className="mt-2 text-sm text-gray-600">Check the URL. This is a demo route.</p>
          <Link
            href="/"
            className="mt-5 inline-flex items-center justify-center rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-600 transition"
          >
            Go home
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-8">
      {/* HEADER */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            Therapist settings
          </div>
          <h1 className="mt-2 text-2xl font-semibold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-600 max-w-xl">
            Manage your profile, notifications, and how your workspace behaves.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/therapist/${therapistId}`}
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition"
          >
            Back to dashboard
          </Link>
        </div>
      </header>

      {/* GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-8">
          {/* PROFILE */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Profile</h2>
                <p className="mt-1 text-sm text-gray-600">Your public therapist identity in Innery.</p>
              </div>
              <button
                type="button"
                onClick={openProfileEdit}
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition"
              >
                Edit
              </button>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-semibold">
                {initials(profile?.name ?? therapist.name)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{profile?.name ?? therapist.name}</p>
                <p className="text-xs text-gray-500 truncate">Therapist ID: {therapistId}</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SettingRow label="Name" value={profile?.name ?? therapist.name} />
              <SettingRow label="Email" value={profile?.email ?? ((therapist as any).email ?? "therapist@innery.com")} />
              <SettingRow label="Role" value="Therapist" />
            </div>

            {editingProfile ? (
              <div className="mt-6 rounded-2xl border border-gray-100 bg-gray-50/40 p-4">
                <p className="text-xs font-semibold text-gray-500">Edit profile</p>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600">Name</label>
                    <input
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600">Email</label>
                    <input
                      value={draftEmail}
                      onChange={(e) => setDraftEmail(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="you@example.com"
                      inputMode="email"
                    />
                  </div>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <p className="text-xs text-gray-500">
                    Saved locally (demo). Later this will connect to backend profile.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={cancelProfileEdit}
                      className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={saveProfileEdit}
                      disabled={profileSaving}
                      className="inline-flex items-center justify-center rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 disabled:opacity-50 transition"
                    >
                      {profileSaving ? "Saving…" : "Save"}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* NOTIFICATIONS */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Notifications</h2>
              <p className="mt-1 text-sm text-gray-600">Control what you receive.</p>
            </div>

            <Toggle
              label="Email notifications"
              description="Receive important updates and reminders."
              checked={prefs.emailNotifications}
              onChange={(v) => update({ emailNotifications: v })}
            />
            <Toggle
              label="Weekly summary"
              description="Get a weekly summary of sessions and activity."
              checked={prefs.weeklySummary}
              onChange={(v) => update({ weeklySummary: v })}
            />
            <Toggle
              label="New client alerts"
              description="Be notified when a client is assigned to you (future)."
              checked={prefs.newClientAlerts}
              onChange={(v) => update({ newClientAlerts: v })}
            />
            <Toggle
              label="Note reminders"
              description="Remind you to write brief session notes after appointments."
              checked={prefs.noteReminders}
              onChange={(v) => update({ noteReminders: v })}
            />
          </div>


          {/* SECURITY */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Security</h2>
                <p className="mt-1 text-sm text-gray-600">Protect your therapist workspace.</p>
              </div>
              <button
                type="button"
                onClick={() => setToast("Update security (demo)")}
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition"
              >
                Update
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SettingRow label="Password" value="••••••••" />
              <SettingRow label="Two-factor auth" value="Disabled (demo)" />
            </div>

            <div className="mt-5 rounded-2xl bg-gray-50/40 border border-gray-100 p-4">
              <p className="text-sm text-gray-700 leading-relaxed">
                When you add backend auth, this will connect to real password + 2FA settings.
              </p>
            </div>
          </div>

          {/* DANGER */}
          <div className="bg-white rounded-2xl border border-rose-200 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-rose-700">Danger zone</h2>
            <p className="mt-2 text-sm text-gray-600 max-w-xl">
              Permanently delete your account and all associated therapeutic data.
            </p>

            <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-xs text-gray-500">Demo action • does not change data</div>
              <button
                type="button"
                onClick={() => setToast("Delete account (demo)")}
                className="inline-flex items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-100 transition"
              >
                Delete account
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <aside className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-900">Account</h3>
            <p className="mt-2 text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{profile?.name ?? therapist.name}</span>
            </p>
            <p className="mt-1 text-xs text-gray-500">Therapist ID: {therapistId}</p>

            <div className="mt-4 rounded-2xl bg-gray-50/40 border border-gray-100 p-4">
              <p className="text-sm text-gray-700 leading-relaxed">
                Preferences are saved locally on this device (localStorage).
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* TOAST */}
      <div
        className={
          "pointer-events-none fixed bottom-4 left-1/2 -translate-x-1/2 transition " +
          (toast ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2")
        }
        aria-live="polite"
      >
        <div className="pointer-events-none rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-lg">
          {toast}
        </div>
      </div>
    </section>
  );
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50/40 p-4">
      <p className="text-xs font-semibold text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-gray-900 truncate">{value}</p>
    </div>
  );
}
