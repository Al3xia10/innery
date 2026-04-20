"use client";

import * as React from "react";
import { useParams } from "next/navigation";

import { SettingsHeader } from "./components/SettingsHeader";
import { SecurityCard } from "./components/SecurityCard";
import { PreferencesSection } from "./components/PreferencesSection";
import { DangerZoneCard } from "./components/DangerZoneCard";

import { useTherapistPrefs } from "./hooks/useTherapistPrefs";
import { useMeProfile } from "./hooks/useMeProfile";

export default function therapistSettingsPage() {
  const params = useParams<{ therapistId?: string }>();
  const therapistId = params?.therapistId ?? "me";

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
    setDraftName,
    setDraftEmail,
    openProfileEdit,
    saveProfileEdit,
  } = useMeProfile({ onToast });

  const { prefs, update } = useTherapistPrefs({ therapistId, onToast });


  const notificationsLabel = prefs.emailNotifications
    ? "Active"
    : "Oprite";

  const handleSaveProfileFromHeader = React.useCallback(
    async (values: {
      name: string;
      email: string;
      notificationsLabel: string;
    }) => {
      const nextEmailNotifications = values.notificationsLabel !== "Oprite";

      if (!editingProfile) {
        openProfileEdit();
      }

      setDraftName(values.name);
      setDraftEmail(values.email);

      await new Promise((resolve) => window.setTimeout(resolve, 0));
      await saveProfileEdit();

      await update({
        emailNotifications: nextEmailNotifications,
      });
    },
    [
      editingProfile,
      openProfileEdit,
      saveProfileEdit,
      setDraftName,
      setDraftEmail,
      update,
    ],
  );

  if (meLoading) {
    return (
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
          <h1 className="text-base font-semibold text-gray-900">Se încarcă…</h1>
        </div>
      </section>
    );
  }

  if (meError) {
    return (
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-2xl border border-rose-200 bg-white p-10 text-center">
          <h1 className="text-base font-semibold text-rose-700">Eroare</h1>
          <p className="mt-2 text-sm text-gray-600">{meError}</p>
        </div>
      </section>
    );
  }

  if (!meUser) {
    return (
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
          <h1 className="text-base font-semibold text-gray-900">Utilizator inexistent</h1>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-3 py-6 space-y-8 sm:px-6 sm:py-10 lg:px-8">
      <SettingsHeader
        name={meUser.name}
        email={meUser.email}
        therapistId={therapistId}
      
        notificationsLabel={notificationsLabel}
        onEditProfile={openProfileEdit}
        onSaveProfile={handleSaveProfileFromHeader}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8 items-start">
        <div className="min-w-0 flex flex-col gap-5 lg:col-span-7 lg:gap-6 lg:min-h-[calc(100vh-220px)]">
          <SecurityCard onToast={onToast} />
          <div className="mt-auto">
            <DangerZoneCard onToast={onToast} />
          </div>
        </div>

        <div className="min-w-0 flex flex-col gap-5 lg:col-span-5 lg:gap-6 xl:pl-2">
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
        <div className="pointer-events-none rounded-[18px] bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-lg">
          {toast}
        </div>
      </div>
    </section>
  );
}