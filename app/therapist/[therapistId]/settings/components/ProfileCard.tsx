"use client";

import type { MeUser } from "../hooks/useMeProfile";
import type { TherapistPrefs } from "../hooks/useTherapistPrefs";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "?";
  const b = (parts.length > 1 ? parts[parts.length - 1]?.[0] : "") ?? "";
  return (a + b).toUpperCase();
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-gray-100 bg-white/70 p-4">
      <p className="text-xs font-semibold text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-gray-900 truncate">{value}</p>
    </div>
  );
}

export function ProfileCard({
  clientId,
  meUser,
  prefs,
  editingProfile,
  draftName,
  setDraftName,
  draftEmail,
  setDraftEmail,
  profileSaving,
  openProfileEdit,
  cancelProfileEdit,
  saveProfileEdit,
}: {
  clientId: string;
  meUser: MeUser;
  prefs: TherapistPrefs;

  editingProfile: boolean;
  draftName: string;
  setDraftName: (v: string) => void;
  draftEmail: string;
  setDraftEmail: (v: string) => void;
  profileSaving: boolean;

  openProfileEdit: () => void;
  cancelProfileEdit: () => void;
  saveProfileEdit: () => Promise<void>;
}) {
  return (
    <div
  className="rounded-[28px] border border-black/5 p-4 shadow-sm sm:rounded-4xl sm:p-6"
  style={{
  background:
    "linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(224,231,255,0.7) 100%)",
}}
>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Profil</h2>
          <p className="mt-1 text-sm text-gray-600">Identitatea ta de terapeut în Innery.</p>
        </div>
        <button
          type="button"
          onClick={openProfileEdit}
          className="inline-flex min-h-10 w-full items-center justify-center rounded-[18px] border border-black/5 bg-white px-4 py-2.5 text-sm font-semibold text-[#7d5d6c] shadow-sm transition hover:bg-[#fffafb] sm:w-auto"
        >
          Editează
        </button>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-semibold">
          {initials(meUser?.name ?? "")}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{meUser?.name ?? ""}</p>
          <p className="text-xs text-gray-500 truncate">ID terapeut: {meUser?.id ?? clientId}</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SettingRow label="Nume" value={meUser?.name ?? ""} />
        <SettingRow label="Email" value={meUser?.email ?? ""} />
        <SettingRow label="Rol" value={meUser?.role ?? "Therapist"} />
      </div>

      {editingProfile ? (
        <div className="mt-6 rounded-[20px] border border-gray-100 bg-gray-50/40 p-4">
          <p className="text-xs font-semibold text-gray-500">Editează profilul</p>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600">Nume</label>
              <input
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Numele tău"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600">Email</label>
              <input
                value={draftEmail}
                onChange={(e) => setDraftEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="email@exemplu.com"
                inputMode="email"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-gray-500">Profilul și setările sunt salvate în contul tău.</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={cancelProfileEdit}
                className="inline-flex min-h-10 items-center justify-center rounded-[18px] border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
              >
                Renunță
              </button>
              <button
                type="button"
                onClick={saveProfileEdit}
                disabled={profileSaving}
                className="inline-flex min-h-10 items-center justify-center rounded-[18px] bg-(--color-accent) px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-50"
              >
                {profileSaving ? "Se salvează…" : "Salvează"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}