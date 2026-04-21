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
    <div className="rounded-[20px] border border-gray-100 bg-gray-50/40 p-4 sm:rounded-[28px]">
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
  const id = React.useId();

  return (
    <div className="group rounded-[20px] border border-gray-100 bg-white p-3.5 shadow-sm transition hover:border-gray-200 hover:shadow-md sm:rounded-[28px]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <label
            htmlFor={id}
            className="block text-[13px] font-semibold text-gray-900 cursor-pointer"
          >
            {label}
          </label>
          <p className="mt-1 text-xs leading-5 sm:leading-relaxed text-gray-500">
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

      <div className="mt-2.5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-[11px] text-gray-500">
        <span className="inline-flex items-center gap-2">
          <span
            className={[
              "h-1.5 w-1.5 rounded-full",
              checked ? "bg-indigo-500" : "bg-gray-300",
            ].join(" ")}
          />
          {checked ? "Activ" : "Dezactivat"}
        </span>
        <button
          type="button"
          onClick={() => onChange(!checked)}
          className="text-indigo-600 hover:text-indigo-700 font-semibold"
        >
          {checked ? "Dezactivează" : "Activează"}
        </button>
      </div>
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
    setToast("Salvat");
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
      setToast("Completează numele și emailul");
      return;
    }

    setProfileSaving(true);
    await new Promise((r) => setTimeout(r, 250));

    const next = { name, email };
    setProfile(next);
    setClientProfile(clientId, next);

    setEditingProfile(false);
    setProfileSaving(false);
    setToast("Salvat");
  }

  if (!client) {
    return (
      <section className="mx-auto max-w-6xl px-3 py-6 sm:px-6 sm:py-10 lg:px-8">
        <div className="rounded-[20px] border border-dashed border-gray-200 bg-white p-6 text-center sm:rounded-[28px] sm:p-10">
         <h1 className="text-base font-semibold text-gray-900">Client inexistent</h1>
          <p className="mt-2 text-sm leading-6 sm:leading-7 text-gray-600">Verifică URL-ul. Aceasta este o rută demo.</p>
          <Link
            href="/"
            className="mt-5 inline-flex min-h-11 w-full sm:w-auto items-center justify-center rounded-[18px] bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600"
          >
            Mergi acasă
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8 space-y-6 sm:space-y-8">
      {/* HEADER */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-[18px] bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100 sm:rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            Setări client
          </div>
          <h1 className="mt-2 text-2xl font-semibold text-gray-900">Preferences</h1>
          <h1 className="mt-2 text-[1.7rem] font-semibold tracking-tight text-gray-900 sm:text-2xl">Preferințe</h1>
<p className="mt-1 max-w-xl text-sm leading-6 sm:leading-7 text-gray-600">
  Controlează notificările, confidențialitatea și modul în care îți partajezi notițele.
</p>
        </div>

       <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
          <Link
            href={`/client/${clientId}`}
            className="inline-flex min-h-11 w-full sm:w-auto items-center justify-center rounded-[18px] border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            Înapoi la dashboard
          </Link>
        </div>
      </header>

      {/* CONTENT GRID */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
        {/* LEFT: SETTINGS */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          {/* PROFILE */}
          <div className="rounded-[20px] border border-gray-100 bg-white p-4 shadow-sm sm:rounded-[28px] sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Profil</h2>
<p className="mt-1 text-sm text-gray-600">Identitatea ta de client în Innery.</p>
              </div>
              <button
                type="button"
                onClick={openProfileEdit}
                className="inline-flex min-h-10 w-full items-center justify-center rounded-[18px] border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#7d5d6c] shadow-sm transition hover:bg-gray-50 sm:w-auto"
              >
                Editează
              </button>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[18px] bg-indigo-50 font-semibold text-indigo-700 sm:rounded-full">
                {initials(profile?.name ?? client.name)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {profile?.name ?? client.name}
                </p>
               <p className="text-xs text-gray-500 truncate">ID client: {clientId}</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
             <SettingRow label="Nume" value={profile?.name ?? client.name} />
<SettingRow label="Email" value={profile?.email ?? ((client as any).email ?? "client@innery.com")} />
<SettingRow label="Rol" value="Client" />
<SettingRow label="Mod confidențialitate" value={prefs.privacyMode[0].toUpperCase() + prefs.privacyMode.slice(1)} />
            </div>

            {editingProfile ? (
             <div className="mt-6 rounded-[20px] border border-gray-100 bg-gray-50/40 p-4 sm:rounded-[28px]">
                <p className="text-xs font-semibold text-gray-500">Editează profilul</p>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600">Nume</label>
                    <input
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      className="mt-1 w-full rounded-[18px] border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
placeholder="Numele tău"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600">Email</label>
                    <input
                      value={draftEmail}
                      onChange={(e) => setDraftEmail(e.target.value)}
                      className="mt-1 w-full rounded-[18px] border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
placeholder="email@exemplu.com"
                      inputMode="email"
                    />
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
  <p className="text-xs text-gray-500">
    Salvat local (demo). Mai târziu se va conecta la profilul din backend.
  </p>
  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={cancelProfileEdit}
                      className="inline-flex min-h-10 items-center justify-center rounded-[18px] border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
                    >
                      Anulează
                    </button>
                    <button
                      type="button"
                      onClick={saveProfileEdit}
                      disabled={profileSaving}
                      className="inline-flex min-h-10 items-center justify-center rounded-[18px] bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600 disabled:opacity-50"
                    >
                      {profileSaving ? "Se salvează…" : "Salveaza"}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* ACCOUNT */}
         <div className="rounded-[20px] border border-gray-100 bg-white p-4 shadow-sm space-y-5 sm:rounded-[28px] sm:p-6">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Notificări</h2>
<p className="mt-1 text-sm leading-6 sm:leading-7 text-gray-600">Alege ce vrei să primești.</p>
            </div>

            <Toggle
              label="Notificări pe email"
description="Primești remindere și actualizări legate de parcursul tău terapeutic."
              checked={prefs.emailNotifications}
              onChange={(v) => update({ emailNotifications: v })}
            />

            <div className="h-px bg-gray-100" />

            <Toggle
              label="Remindere pentru ședințe"
description="Primești un reminder înainte de o ședință viitoare."
              checked={prefs.sessionReminders}
              onChange={(v) => update({ sessionReminders: v })}
            />
          </div>

          {/* PRIVACY */}
          <div className="rounded-[20px] border border-gray-100 bg-white p-4 shadow-sm space-y-5 sm:rounded-[28px] sm:p-6">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Confidențialitate și partajare</h2>
<p className="mt-1 text-sm leading-6 sm:leading-7 text-gray-600">
  Tu deții controlul. Settingsle implicite pot fi schimbate oricând.
</p>
            </div>

            <Toggle
              label="Partajează reflecțiile implicit"
description="Când este activat, noile reflecții vor fi marcate ca partajabile (poți schimba asta ulterior pentru fiecare item)."
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
              <p className="text-sm font-semibold text-gray-900">Mod de confidențialitate</p>
<p className="text-xs text-gray-500">
  Un preset simplu care influențează setările implicite viitoare. (Doar demo)
</p>

              <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => update({ privacyMode: "private", shareNotesByDefault: false, shareReflectionsByDefault: false })}
                  className={
                    "rounded-[18px] border px-4 py-3 text-left transition " +
                    (prefs.privacyMode === "private"
                      ? "border-indigo-200 bg-indigo-50"
                      : "border-gray-200 bg-white hover:bg-gray-50")
                  }
                >
                  <p className="text-sm font-semibold text-gray-900">Privat</p>
<p className="mt-1 text-xs leading-5 text-gray-500">Păstrează totul privat în mod implicit.</p>
                </button>

                <button
                  type="button"
                  onClick={() => update({ privacyMode: "balanced" })}
                  className={
                    "rounded-[18px] border px-4 py-3 text-left transition " +
                    (prefs.privacyMode === "balanced"
                      ? "border-indigo-200 bg-indigo-50"
                      : "border-gray-200 bg-white hover:bg-gray-50")
                  }
                >
                  <p className="text-sm font-semibold text-gray-900">Echilibrat</p>
<p className="mt-1 text-xs leading-5 text-gray-500">Alegi pentru fiecare reflecție / notiță.</p>
                </button>

                <button
                  type="button"
                  onClick={() => update({ privacyMode: "open", shareNotesByDefault: true, shareReflectionsByDefault: true })}
                  className={
                    "rounded-[18px] border px-4 py-3 text-left transition " +
                    (prefs.privacyMode === "open"
                      ? "border-indigo-200 bg-indigo-50"
                      : "border-gray-200 bg-white hover:bg-gray-50")
                  }
                >
                  <p className="text-sm font-semibold text-gray-900">Deschis</p>
<p className="mt-1 text-xs leading-5 text-gray-500">Partajează implicit (poți retrage ulterior).</p>
                </button>
              </div>
            </div>

           <p className="text-xs leading-5 text-gray-400">
  Mai târziu, acestea se vor conecta la permisiuni reale și la vizibilitatea terapeutului.
</p>
          </div>

          {/* DANGER */}
         <div className="rounded-[20px] border border-gray-100 bg-white p-4 shadow-sm sm:rounded-[28px] sm:p-6">
            <h2 className="text-sm font-semibold text-gray-900">Starea contului</h2>
<p className="mt-2 text-sm leading-6 sm:leading-7 text-gray-600">
  Dacă ai nevoie de o pauză, poți întrerupe parcursul tău terapeutic.
</p>

            <div className="mt-4 flex flex-col gap-2.5 sm:mt-5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <div className="text-xs text-gray-500">Acțiune demo • nu modifică datele</div>
              <button
                type="button"
                onClick={() => setToast("Cont pus pe pauză (demo)")}
                className="inline-flex min-h-11 w-full sm:w-auto items-center justify-center rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
              >
                Pune contul pe pauză
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: SUMMARY */}
        <aside className="space-y-5 sm:space-y-6">
          <div className="rounded-[20px] border border-gray-100 bg-white p-4 shadow-sm sm:rounded-[28px] sm:p-6">
            <h3 className="text-sm font-semibold text-gray-900">Cont</h3>
            <p className="mt-2 text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{profile?.name ?? client.name}</span>
            </p>
            <p className="mt-1 text-xs text-gray-500">ID client: {clientId}</p>

            <div className="mt-4 rounded-[20px] border border-gray-100 bg-gray-50/40 p-4 sm:rounded-[28px]">
  <p className="text-sm leading-6 sm:leading-relaxed text-gray-700">
    Preferințele sunt salvate local pe acest dispozitiv (localStorage).
  </p>
</div>
          </div>

          <div className="rounded-[20px] border border-indigo-100 bg-indigo-50 p-4 sm:rounded-[28px] sm:p-6">
            <h3 className="text-sm font-semibold text-indigo-700">Sugestie</h3>
<p className="mt-2 text-sm leading-6 sm:leading-7 text-indigo-700/80">
  Poți păstra notițele private și să le partajezi doar pe cele care îți ajută ședințele.
</p>
          </div>
        </aside>
      </div>

      {/* TOAST */}
      <div className="pointer-events-none rounded-[18px] bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-lg sm:rounded-full">
        <div className="pointer-events-none rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-lg">
          {toast}
        </div>
      </div>
    </section>
  );
}