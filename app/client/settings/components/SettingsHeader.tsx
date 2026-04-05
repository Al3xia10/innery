"use client";

import * as React from "react";
import Link from "next/link";

type SettingsHeaderProps = {
  name?: string;
  email?: string;
  clientId?: string | number;
  privacyMode?: string;
  notificationsLabel?: string;
  onEditProfile?: () => void;
  onSaveProfile?: (values: {
    name: string;
    email: string;
    privacyMode: string;
    notificationsLabel: string;
  }) => void;
};

export function SettingsHeader({
  name = "Alexia",
  email = "mami@gmail.com",
  clientId = 1,
  privacyMode = "Balanced",
  notificationsLabel = "Notificări active",
  onEditProfile,
  onSaveProfile,
}: SettingsHeaderProps) {
  const [profileName, setProfileName] = React.useState(name);
  const [profileEmail, setProfileEmail] = React.useState(email);
  const [profilePrivacyMode, setProfilePrivacyMode] = React.useState(privacyMode);
  const [profileNotificationsLabel, setProfileNotificationsLabel] = React.useState(notificationsLabel);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [draftName, setDraftName] = React.useState(name);
  const [draftEmail, setDraftEmail] = React.useState(email);
  const [draftPrivacyMode, setDraftPrivacyMode] = React.useState(privacyMode);
  const [draftNotificationsLabel, setDraftNotificationsLabel] = React.useState(notificationsLabel);

  React.useEffect(() => {
    setProfileName(name);
    setProfileEmail(email);
    setProfilePrivacyMode(privacyMode);
    setProfileNotificationsLabel(notificationsLabel);
    setDraftName(name);
    setDraftEmail(email);
    setDraftPrivacyMode(privacyMode);
    setDraftNotificationsLabel(notificationsLabel);
  }, [name, email, privacyMode, notificationsLabel]);

  function openEditModal() {
    onEditProfile?.();
    setDraftName(profileName);
    setDraftEmail(profileEmail);
    setDraftPrivacyMode(profilePrivacyMode);
    setDraftNotificationsLabel(profileNotificationsLabel);
    setIsEditOpen(true);
  }

  function closeEditModal() {
    setIsEditOpen(false);
  }

  function saveProfile() {
    const trimmedName = draftName.trim();
    const trimmedEmail = draftEmail.trim();
    const trimmedPrivacyMode = draftPrivacyMode.trim();
    const trimmedNotificationsLabel = draftNotificationsLabel.trim();

    if (!trimmedName || !trimmedEmail) return;

    setProfileName(trimmedName);
    setProfileEmail(trimmedEmail);
    setProfilePrivacyMode(trimmedPrivacyMode || "Balanced");
    setProfileNotificationsLabel(trimmedNotificationsLabel || "Notificări active");

    onSaveProfile?.({
      name: trimmedName,
      email: trimmedEmail,
      privacyMode: trimmedPrivacyMode || "Balanced",
      notificationsLabel: trimmedNotificationsLabel || "Notificări active",
    });

    setIsEditOpen(false);
  }

  return (
    <header>
      <div
        className="overflow-hidden rounded-4xl border border-black/5 shadow-[0_10px_28px_rgba(31,23,32,0.05)]"
        style={{
          background:
            "linear-gradient(135deg, #ffffff 0%, rgba(239,208,202,0.18) 60%, rgba(125,128,218,0.08) 100%)",
        }}
      >
        <div className="mx-auto max-w-6xl px-6 py-8 lg:px-8">
          <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
            <div className="min-w-0">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-black/5 bg-[#f3eef6] text-3xl font-semibold text-(--color-primary) shadow-[0_6px_14px_rgba(31,23,32,0.04)]">
                  {profileName?.charAt(0)?.toUpperCase() || "A"}
                </div>

                <div className="min-w-0 flex-1">
                  <h1 className="text-[1.4rem] font-semibold leading-[1.02] tracking-tight text-foreground sm:text-[1.6rem]">
                    {profileName}
                  </h1>
                  <p className="max-w-2xl text-[15px] leading-8 text-[#74656d] sm:text-[1rem]">
                    {profileEmail}
                  </p>
                  <p className="mt-1 text-sm font-medium text-[#8a7b84]">
                    Client ID: {clientId}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center xl:justify-end xl:mt-1">
              <button
                type="button"
                onClick={openEditModal}
                className="inline-flex w-full sm:w-auto items-center justify-center rounded-full border border-[#ead7df] bg-white px-5 py-2.5 text-sm font-semibold text-[#7d5d6c] shadow-[0_6px_14px_rgba(31,23,32,0.05)] transition hover:bg-[#fff7fa]"
              >
                Editează profilul
              </button>

              <Link
                href="/client"
                className="inline-flex w-full sm:w-auto items-center justify-center rounded-full bg-(--color-accent) px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(239,135,192,0.25)] transition hover:opacity-90"
              >
                Înapoi la dashboard
              </Link>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-3xl border border-black/5 bg-white/85 px-4 py-3 shadow-[0_4px_10px_rgba(31,23,32,0.03)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8a7b84]">
                Profil
              </p>
              <p className="mt-2 text-base font-semibold text-foreground">
                Despre tine
              </p>
            </div>

            <div className="rounded-3xl border border-black/5 bg-white/85 px-4 py-4 shadow-[0_4px_10px_rgba(31,23,32,0.03)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8a7b84]">
                Confidentialitate
              </p>
              <p className="mt-2 text-base font-semibold text-foreground">{profilePrivacyMode}</p>
            </div>

            <div className="rounded-3xl border border-black/5 bg-white/85 px-4 py-4 shadow-[0_4px_10px_rgba(31,23,32,0.03)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8a7b84]">
                Notificări
              </p>
              <p className="mt-2 text-base font-semibold text-foreground">{profileNotificationsLabel}</p>
            </div>
          </div>
        </div>
      </div>
      {isEditOpen ? (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-[rgba(24,18,24,0.32)] px-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-4xl border border-black/5 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(255,250,251,0.96)_100%)] shadow-[0_24px_60px_rgba(31,23,32,0.16)]">
            <div className="flex items-start justify-between gap-4 border-b border-black/5 px-6 py-5 sm:px-7">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8a7b84]">
                  Editează profilul
                </p>
                <h2 className="mt-2 text-[1.45rem] font-semibold tracking-tight text-foreground sm:text-[1.7rem]">
                  Actualizează datele tale
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-7 text-[#74656d]">
                  Poți schimba numele, emailul și preferințele principale direct din acest spațiu.
                </p>
              </div>

              <button
                type="button"
                onClick={closeEditModal}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-black/5 bg-white text-lg text-[#7d5d6c] shadow-[0_4px_10px_rgba(31,23,32,0.04)] transition hover:bg-[#fff7fa]"
                aria-label="Închide"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 px-6 py-6 sm:grid-cols-2 sm:px-7">
              <label className="flex flex-col gap-2 sm:col-span-1">
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8a7b84]">
                  Nume
                </span>
                <input
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  className="rounded-2xl border border-black/5 bg-white px-4 py-3 text-sm text-foreground shadow-[0_4px_10px_rgba(31,23,32,0.03)] outline-none transition focus:border-[#e7bfd2] focus:ring-2 focus:ring-[#f6dce9]"
                  placeholder="Numele tău"
                />
              </label>

              <label className="flex flex-col gap-2 sm:col-span-1">
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8a7b84]">
                  Email
                </span>
                <input
                  value={draftEmail}
                  onChange={(e) => setDraftEmail(e.target.value)}
                  className="rounded-2xl border border-black/5 bg-white px-4 py-3 text-sm text-foreground shadow-[0_4px_10px_rgba(31,23,32,0.03)] outline-none transition focus:border-[#e7bfd2] focus:ring-2 focus:ring-[#f6dce9]"
                  placeholder="email@exemplu.com"
                />
              </label>

              <label className="flex flex-col gap-2 sm:col-span-1">
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8a7b84]">
                  Privacy mode
                </span>
                <select
                  value={draftPrivacyMode}
                  onChange={(e) => setDraftPrivacyMode(e.target.value)}
                  className="rounded-2xl border border-black/5 bg-white px-4 py-3 text-sm text-foreground shadow-[0_4px_10px_rgba(31,23,32,0.03)] outline-none transition focus:border-[#e7bfd2] focus:ring-2 focus:ring-[#f6dce9]"
                >
                  <option value="Balanced">Balanced</option>
                  <option value="Private">Private</option>
                  <option value="Open">Open</option>
                </select>
              </label>

              <label className="flex flex-col gap-2 sm:col-span-1">
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8a7b84]">
                  Notificări
                </span>
                <select
                  value={draftNotificationsLabel}
                  onChange={(e) => setDraftNotificationsLabel(e.target.value)}
                  className="rounded-2xl border border-black/5 bg-white px-4 py-3 text-sm text-foreground shadow-[0_4px_10px_rgba(31,23,32,0.03)] outline-none transition focus:border-[#e7bfd2] focus:ring-2 focus:ring-[#f6dce9]"
                >
                  <option value="Notificări active">Active</option>
                  <option value="Doar importante">Doar importante</option>
                  <option value="Fără notificări">Oprite</option>
                </select>
              </label>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-black/5 px-6 py-5 sm:flex-row sm:justify-end sm:px-7">
              <button
                type="button"
                onClick={closeEditModal}
                className="inline-flex items-center justify-center rounded-full border border-black/5 bg-white px-5 py-2.5 text-sm font-semibold text-foreground shadow-[0_6px_14px_rgba(31,23,32,0.05)] transition hover:bg-[#fffafb]"
              >
                Renunță
              </button>
              <button
                type="button"
                onClick={saveProfile}
                className="inline-flex items-center justify-center rounded-full bg-(--color-accent) px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(239,135,192,0.25)] transition hover:opacity-90"
              >
                Salvează modificările
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}