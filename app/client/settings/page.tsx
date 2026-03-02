"use client";

import * as React from "react";
import { useParams } from "next/navigation";

import { SettingsHeader } from "./components/SettingsHeader";
import { ProfileCard } from "./components/ProfileCard";
import { SecurityCard } from "./components/SecurityCard";
import { PreferencesSection } from "./components/PreferencesSection";
import { DangerZoneCard } from "./components/DangerZoneCard";

import { useClientPrefs } from "./hooks/useClientPrefs";
import { useMeProfile } from "./hooks/useMeProfile";

export default function ClientSettingsPage() {
  const params = useParams<{ clientId?: string }>();
  const clientId = params?.clientId ?? "me";

  const [toast, setToast] = React.useState<string | null>(null);

  const onToast = React.useCallback((msg: string) => {
    setToast(msg);
  }, []);

  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  const {
    meLoading,
    meError,
    meUser,
    editingProfile,
    draftName,
    setDraftName,
    draftEmail,
    setDraftEmail,
    profileSaving,
    openProfileEdit,
    cancelProfileEdit,
    saveProfileEdit,
  } = useMeProfile({ onToast });

  const { prefs, update } = useClientPrefs({ clientId, onToast });

  if (meLoading) {
    return (
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
          <h1 className="text-base font-semibold text-gray-900">Loading…</h1>
        </div>
      </section>
    );
  }

  if (meError) {
    return (
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-2xl border border-rose-200 bg-white p-10 text-center">
          <h1 className="text-base font-semibold text-rose-700">Error</h1>
          <p className="mt-2 text-sm text-gray-600">{meError}</p>
        </div>
      </section>
    );
  }

  if (!meUser) {
    return (
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
          <h1 className="text-base font-semibold text-gray-900">No user</h1>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <SettingsHeader />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="min-w-0 lg:col-span-7 flex flex-col gap-6 lg:min-h-[calc(100vh-220px)]">
          <ProfileCard
            clientId={clientId}
            meUser={meUser}
            prefs={prefs}
            editingProfile={editingProfile}
            draftName={draftName}
            setDraftName={setDraftName}
            draftEmail={draftEmail}
            setDraftEmail={setDraftEmail}
            profileSaving={profileSaving}
            openProfileEdit={openProfileEdit}
            cancelProfileEdit={cancelProfileEdit}
            saveProfileEdit={saveProfileEdit}
          />
          <SecurityCard onToast={onToast} />
          <div className="mt-auto">
            <DangerZoneCard onToast={onToast} />
          </div>
        </div>

        <div className="min-w-0 lg:col-span-5 xl:pl-2 flex flex-col gap-6">
          <PreferencesSection prefs={prefs} update={update} onToast={onToast} />
        </div>
      </div>

      {/* TOAST (păstrat exact ca înainte) */}
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