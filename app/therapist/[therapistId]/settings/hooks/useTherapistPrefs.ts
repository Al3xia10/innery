"use client";

import * as React from "react";
import { apiFetch } from "@/app/_lib/authClient";

export type TherapistPrefs = {
  weeklySummary: boolean;
  emailNotifications: boolean;
  noteReminders: boolean;
  newClientAlerts: boolean;
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

export function useTherapistPrefs({
  therapistId,
  onToast,
}: {
  therapistId: string;
  onToast?: (msg: string) => void;
}) {
  const defaultPrefs: TherapistPrefs = React.useMemo(
    () => ({
      weeklySummary: true,
      emailNotifications: true,
      noteReminders: true,
      newClientAlerts: true,
    }),
    []
  );

  const [hydrated, setHydrated] = React.useState(false);
  const [prefs, setPrefs] = React.useState<TherapistPrefs>(defaultPrefs);

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      const cached = safeParse<TherapistPrefs>(localStorage.getItem(storageKey(therapistId)));
      if (cached) {
        setPrefs({
          weeklySummary: !!cached.weeklySummary,
          emailNotifications: !!cached.emailNotifications,
          noteReminders: !!cached.noteReminders,
          newClientAlerts: !!cached.newClientAlerts,
        });
      } else {
        localStorage.setItem(storageKey(therapistId), JSON.stringify(defaultPrefs));
        setPrefs(defaultPrefs);
      }
      setHydrated(true);

      try {
        const res = await apiFetch("/api/therapist/settings", { method: "GET" });
        const s = (res as any)?.settings ?? (res as any);
        if (!s) return;

        const next: TherapistPrefs = {
          weeklySummary: !!s.weeklySummary,
          emailNotifications: !!s.emailNotifications,
          noteReminders: !!s.noteReminders,
          newClientAlerts: !!s.newClientAlerts,
        };

        if (!cancelled) {
          setPrefs(next);
          localStorage.setItem(storageKey(therapistId), JSON.stringify(next));
        }
      } catch {
        // keep cached values silently
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [therapistId, defaultPrefs]);

  React.useEffect(() => {
    if (!hydrated || !therapistId) return;
    localStorage.setItem(storageKey(therapistId), JSON.stringify(prefs));
  }, [prefs, hydrated, therapistId]);

  async function update(next: Partial<TherapistPrefs>) {
    let prev: TherapistPrefs | null = null;

    setPrefs((p) => {
      prev = p;
      return { ...p, ...next } as TherapistPrefs;
    });

    onToast?.("Saving…");

    const merged = { ...prefs, ...next } as TherapistPrefs;

    try {
      await apiFetch("/api/therapist/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(merged),
      });

      localStorage.setItem(storageKey(therapistId), JSON.stringify(merged));
      onToast?.("Salvat");
    } catch {
      if (prev) setPrefs(prev);
      onToast?.("Could not save");
    }
  }

  return { prefs, setPrefs, hydrated, defaultPrefs, update };
}