"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { clients } from "@/app/_mock/data";
import { getClientProfile, setClientProfile } from "@/app/_lib/profile";

type ClientPrefs = {
  emailNotifications: boolean;
  sessionReminders: boolean;
  shareReflectionsByDefault: boolean;
  shareNotesByDefault: boolean;
  privacyMode: "balanced" | "private" | "open";
};

type ClientProfileOverride = {
  name: string;
  email: string;
};


function storageKey(clientId: string) {
  return `innery_client_prefs_${clientId}`;
}

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function clampPrivacyMode(v: unknown): ClientPrefs["privacyMode"] {
  if (v === "private" || v === "open" || v === "balanced") return v;
  return "balanced";
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "?";
  const b = (parts.length > 1 ? parts[parts.length - 1]?.[0] : "") ?? "";
  return (a + b).toUpperCase();
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50/40 p-4">
      <p className="text-xs font-semibold text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-gray-900 truncate">{value}</p>
    </div>
  );
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
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-900">{label}</p>
        <p className="mt-1 text-xs text-gray-500 leading-relaxed">{description}</p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={
          "relative inline-flex h-7 w-12 items-center rounded-full transition ring-1 ring-inset " +
          (checked
            ? "bg-indigo-500 ring-indigo-500"
            : "bg-gray-200 ring-gray-200")
        }
      >
        <span
          className={
            "inline-block h-6 w-6 transform rounded-full bg-white shadow-sm transition " +
            (checked ? "translate-x-5" : "translate-x-1")
          }
        />
      </button>
    </div>
  );
}

export default function ClientSettingsPage() {
  const params = useParams<{ clientId: string }>();
  const clientId = params?.clientId ?? "";

  const client = React.useMemo(() => clients.find((c) => c.id === clientId), [clientId]);

  const [profile, setProfile] = React.useState<ClientProfileOverride | null>(null);
  const [editingProfile, setEditingProfile] = React.useState(false);
  const [draftName, setDraftName] = React.useState("");
  const [draftEmail, setDraftEmail] = React.useState("");
  const [profileSaving, setProfileSaving] = React.useState(false);

  const defaultPrefs: ClientPrefs = React.useMemo(
    () => ({
      emailNotifications: true,
      sessionReminders: true,
      shareReflectionsByDefault: false,
      shareNotesByDefault: false,
      privacyMode: "balanced",
    }),
    []
  );

  const [hydrated, setHydrated] = React.useState(false);
  const [prefs, setPrefs] = React.useState<ClientPrefs>(defaultPrefs);
  const [toast, setToast] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!clientId) return;
    const existing = safeParse<ClientPrefs>(localStorage.getItem(storageKey(clientId)));
    if (existing) {
      setPrefs({
        emailNotifications: !!existing.emailNotifications,
        sessionReminders: !!existing.sessionReminders,
        shareReflectionsByDefault: !!existing.shareReflectionsByDefault,
        shareNotesByDefault: !!existing.shareNotesByDefault,
        privacyMode: clampPrivacyMode(existing.privacyMode),
      });
    } else {
      localStorage.setItem(storageKey(clientId), JSON.stringify(defaultPrefs));
      setPrefs(defaultPrefs);
    }
    setHydrated(true);
  }, [clientId, defaultPrefs]);

  React.useEffect(() => {
    if (!clientId || !client) return;

    const fallbackEmail = (client as any).email ?? "client@innery.com";
    const next = getClientProfile(clientId, client.name, fallbackEmail);

    setProfile(next);
    setDraftName(next.name);
    setDraftEmail(next.email);
  }, [clientId, client]);

  React.useEffect(() => {
    if (!hydrated || !clientId) return;
    localStorage.setItem(storageKey(clientId), JSON.stringify(prefs));
  }, [prefs, hydrated, clientId]);

  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  function update(next: Partial<ClientPrefs>) {
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
    if (!clientId || !profile) return;

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
    setClientProfile(clientId, next);

    setEditingProfile(false);
    setProfileSaving(false);
    setToast("Saved");
  }

  if (!client) {
    return (
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
          <h1 className="text-base font-semibold text-gray-900">Client not found</h1>
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
            Settings
          </div>
          <h1 className="mt-2 text-2xl font-semibold text-gray-900">Preferences</h1>
          <p className="mt-1 text-sm text-gray-600 max-w-xl">
            Control notifications, privacy, and how you share your notes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/client/${clientId}`}
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition"
          >
            Back to dashboard
          </Link>
        </div>
      </header>

      {/* CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: SETTINGS */}
        <div className="lg:col-span-2 space-y-8">
          {/* PROFILE */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Profile</h2>
                <p className="mt-1 text-sm text-gray-600">Your client identity in Innery.</p>
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
                {initials(profile?.name ?? client.name)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {profile?.name ?? client.name}
                </p>
                <p className="text-xs text-gray-500 truncate">Client ID: {clientId}</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SettingRow label="Name" value={profile?.name ?? client.name} />
              <SettingRow label="Email" value={profile?.email ?? ((client as any).email ?? "client@innery.com")} />
              <SettingRow label="Role" value="Client" />
              <SettingRow label="Privacy mode" value={prefs.privacyMode[0].toUpperCase() + prefs.privacyMode.slice(1)} />
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

          {/* ACCOUNT */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">
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
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Privacy & sharing</h2>
              <p className="mt-1 text-sm text-gray-600">
                You stay in control. Defaults can be changed any time.
              </p>
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

            <div className="h-px bg-gray-100" />

            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-gray-900">Privacy mode</p>
              <p className="text-xs text-gray-500">
                A simple preset that influences future defaults. (Demo only)
              </p>

              <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => update({ privacyMode: "private", shareNotesByDefault: false, shareReflectionsByDefault: false })}
                  className={
                    "rounded-xl border px-4 py-3 text-left transition " +
                    (prefs.privacyMode === "private"
                      ? "border-indigo-200 bg-indigo-50"
                      : "border-gray-200 bg-white hover:bg-gray-50")
                  }
                >
                  <p className="text-sm font-semibold text-gray-900">Private</p>
                  <p className="mt-1 text-xs text-gray-500">Keep everything private by default.</p>
                </button>

                <button
                  type="button"
                  onClick={() => update({ privacyMode: "balanced" })}
                  className={
                    "rounded-xl border px-4 py-3 text-left transition " +
                    (prefs.privacyMode === "balanced"
                      ? "border-indigo-200 bg-indigo-50"
                      : "border-gray-200 bg-white hover:bg-gray-50")
                  }
                >
                  <p className="text-sm font-semibold text-gray-900">Balanced</p>
                  <p className="mt-1 text-xs text-gray-500">Choose per reflection / note.</p>
                </button>

                <button
                  type="button"
                  onClick={() => update({ privacyMode: "open", shareNotesByDefault: true, shareReflectionsByDefault: true })}
                  className={
                    "rounded-xl border px-4 py-3 text-left transition " +
                    (prefs.privacyMode === "open"
                      ? "border-indigo-200 bg-indigo-50"
                      : "border-gray-200 bg-white hover:bg-gray-50")
                  }
                >
                  <p className="text-sm font-semibold text-gray-900">Open</p>
                  <p className="mt-1 text-xs text-gray-500">Share by default (you can revoke later).</p>
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-400">
              Later, these will connect to real permissions and therapist visibility.
            </p>
          </div>

          {/* DANGER */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900">Account status</h2>
            <p className="mt-2 text-sm text-gray-600">
              If you need a break, you can pause your therapy journey.
            </p>

            <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-xs text-gray-500">Demo action • does not change data</div>
              <button
                type="button"
                onClick={() => setToast("Paused (demo)")}
                className="inline-flex items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-100 transition"
              >
                Pause account
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: SUMMARY */}
        <aside className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900">Account</h3>
            <p className="mt-2 text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{profile?.name ?? client.name}</span>
            </p>
            <p className="mt-1 text-xs text-gray-500">Client ID: {clientId}</p>

            <div className="mt-4 rounded-2xl bg-gray-50/40 border border-gray-100 p-4">
              <p className="text-sm text-gray-700 leading-relaxed">
                Preferences are saved locally on this device (localStorage).
              </p>
            </div>
          </div>

          <div className="bg-indigo-50 rounded-2xl border border-indigo-100 p-6">
            <h3 className="text-sm font-semibold text-indigo-700">Tip</h3>
            <p className="mt-2 text-sm text-indigo-700/80">
              You can keep notes private and share only the ones that help your sessions.
            </p>
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