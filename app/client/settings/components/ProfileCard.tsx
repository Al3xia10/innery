"use client";

import * as React from "react";
import type { ClientPrefs } from "../hooks/useClientPrefs";
import type { MeUser } from "../hooks/useMeProfile";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "?";
  const b = (parts.length > 1 ? parts[parts.length - 1]?.[0] : "") ?? "";
  return (a + b).toUpperCase();
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white/70 p-4">
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
  prefs: ClientPrefs;

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
  className="rounded-3xl border border-black/5 shadow-sm p-6"
  style={{
  background:
    "linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(224,231,255,0.7) 100%)",
}}
>
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
          {initials(meUser?.name ?? "")}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{meUser?.name ?? ""}</p>
          <p className="text-xs text-gray-500 truncate">Client ID: {meUser?.id ?? clientId}</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SettingRow label="Name" value={meUser?.name ?? ""} />
        <SettingRow label="Email" value={meUser?.email ?? ""} />
        <SettingRow label="Role" value={meUser?.role ?? "Client"} />
        <SettingRow
          label="Privacy mode"
          value={prefs.privacyMode[0].toUpperCase() + prefs.privacyMode.slice(1)}
        />
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
            <p className="text-xs text-gray-500">Profile and settings are saved to your account.</p>
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
  );
}