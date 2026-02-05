"use client";

import * as React from "react";

export type ClientProfileOverride = { name: string; email: string };
export type TherapistProfileOverride = { name: string; email: string };

const CLIENT_EVENT = "innery:client-profile-update";
const THERAPIST_EVENT = "innery:therapist-profile-update";

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function clientProfileKey(clientId: string) {
  return `innery_client_profile_${clientId}`;
}

function notifyClient(clientId: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CLIENT_EVENT, { detail: { clientId } }));
}

export function therapistProfileKey(therapistId: string) {
  return `innery_therapist_profile_${therapistId}`;
}

function notifyTherapist(therapistId: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(THERAPIST_EVENT, { detail: { therapistId } }));
}

/** READ (client) */
export function getClientProfile(
  clientId: string,
  fallbackName = "Client",
  fallbackEmail = "client@innery.com"
): ClientProfileOverride {
  if (!clientId || !canUseStorage()) return { name: fallbackName, email: fallbackEmail };

  const existing = safeParse<ClientProfileOverride>(
    localStorage.getItem(clientProfileKey(clientId))
  );

  return {
    name: (existing?.name ?? fallbackName).toString(),
    email: (existing?.email ?? fallbackEmail).toString(),
  };
}

/** WRITE (client) */
export function setClientProfile(clientId: string, profile: ClientProfileOverride) {
  if (!clientId || !canUseStorage()) return;
  localStorage.setItem(clientProfileKey(clientId), JSON.stringify(profile));
  notifyClient(clientId);
}

/** HOOK (client) */
export function useClientProfile(
  clientId: string,
  fallbackName = "Client",
  fallbackEmail = "client@innery.com"
) {
  const [profile, setProfile] = React.useState<ClientProfileOverride>(() =>
    getClientProfile(clientId, fallbackName, fallbackEmail)
  );

  // Re-hydrate when route/id changes
  React.useEffect(() => {
    setProfile(getClientProfile(clientId, fallbackName, fallbackEmail));
  }, [clientId, fallbackName, fallbackEmail]);

  // Update if localStorage changes (other tabs) OR when we notify locally
  React.useEffect(() => {
    if (!clientId || typeof window === "undefined") return;

    const onStorage = (e: StorageEvent) => {
      if (e.key === clientProfileKey(clientId)) {
        setProfile(getClientProfile(clientId, fallbackName, fallbackEmail));
      }
    };

    const onCustom = (e: Event) => {
      const detail = (e as CustomEvent).detail as { clientId?: string };
      if (detail?.clientId === clientId) {
        setProfile(getClientProfile(clientId, fallbackName, fallbackEmail));
      }
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener(CLIENT_EVENT, onCustom as EventListener);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(CLIENT_EVENT, onCustom as EventListener);
    };
  }, [clientId, fallbackName, fallbackEmail]);

  return profile; // { name, email }
}

/** READ (therapist) */
export function getTherapistProfile(
  therapistId: string,
  fallbackName = "Therapist",
  fallbackEmail = "therapist@innery.com"
): TherapistProfileOverride {
  if (!therapistId || !canUseStorage()) return { name: fallbackName, email: fallbackEmail };

  const existing = safeParse<TherapistProfileOverride>(
    localStorage.getItem(therapistProfileKey(therapistId))
  );

  return {
    name: (existing?.name ?? fallbackName).toString(),
    email: (existing?.email ?? fallbackEmail).toString(),
  };
}

/** WRITE (therapist) */
export function setTherapistProfile(therapistId: string, profile: TherapistProfileOverride) {
  if (!therapistId || !canUseStorage()) return;
  localStorage.setItem(therapistProfileKey(therapistId), JSON.stringify(profile));
  notifyTherapist(therapistId);
}

/** HOOK (therapist) */
export function useTherapistProfile(
  therapistId: string,
  fallbackName = "Therapist",
  fallbackEmail = "therapist@innery.com"
) {
  const [profile, setProfile] = React.useState<TherapistProfileOverride>(() =>
    getTherapistProfile(therapistId, fallbackName, fallbackEmail)
  );

  React.useEffect(() => {
    setProfile(getTherapistProfile(therapistId, fallbackName, fallbackEmail));
  }, [therapistId, fallbackName, fallbackEmail]);

  React.useEffect(() => {
    if (!therapistId || typeof window === "undefined") return;

    const onStorage = (e: StorageEvent) => {
      if (e.key === therapistProfileKey(therapistId)) {
        setProfile(getTherapistProfile(therapistId, fallbackName, fallbackEmail));
      }
    };

    const onCustom = (e: Event) => {
      const detail = (e as CustomEvent).detail as { therapistId?: string };
      if (detail?.therapistId === therapistId) {
        setProfile(getTherapistProfile(therapistId, fallbackName, fallbackEmail));
      }
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener(THERAPIST_EVENT, onCustom as EventListener);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(THERAPIST_EVENT, onCustom as EventListener);
    };
  }, [therapistId, fallbackName, fallbackEmail]);

  return profile; // { name, email }
}