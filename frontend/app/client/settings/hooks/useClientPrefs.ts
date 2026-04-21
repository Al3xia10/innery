"use client";

import * as React from "react";
import { apiFetch } from "@/app/_lib/authClient";

export type ClientPrefs = {
  emailNotifications: boolean;
  sessionReminders: boolean;
  shareReflectionsByDefault: boolean;
  shareNotesByDefault: boolean;
  privacyMode: "balanced" | "private" | "open";
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

export function useClientPrefs({
  clientId,
  onToast,
}: {
  clientId: string;
  onToast?: (msg: string) => void;
}) {
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

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      // 1) Local cache hydrate (instant UI)
      const cached = safeParse<ClientPrefs>(localStorage.getItem(storageKey(clientId)));
      if (cached) {
        setPrefs({
          emailNotifications: !!cached.emailNotifications,
          sessionReminders: !!cached.sessionReminders,
          shareReflectionsByDefault: !!cached.shareReflectionsByDefault,
          shareNotesByDefault: !!cached.shareNotesByDefault,
          privacyMode: clampPrivacyMode((cached as any).privacyMode),
        });
      } else {
        localStorage.setItem(storageKey(clientId), JSON.stringify(defaultPrefs));
        setPrefs(defaultPrefs);
      }
      setHydrated(true);

      // 2) Backend source of truth
      try {
        const res = await apiFetch("/api/client/settings", { method: "GET" });
        const s = (res as any)?.settings ?? (res as any);
        if (!s) return;

        const next: ClientPrefs = {
          emailNotifications: !!s.emailNotifications,
          sessionReminders: !!s.sessionReminders,
          shareReflectionsByDefault: !!s.shareReflectionsByDefault,
          shareNotesByDefault: !!s.shareNotesByDefault,
          privacyMode: clampPrivacyMode(s.privacyMode),
        };

        if (!cancelled) {
          setPrefs(next);
          localStorage.setItem(storageKey(clientId), JSON.stringify(next));
        }
      } catch {
        // keep cached values silently
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [clientId, defaultPrefs]);

  React.useEffect(() => {
    if (!hydrated || !clientId) return;
    localStorage.setItem(storageKey(clientId), JSON.stringify(prefs));
  }, [prefs, hydrated, clientId]);

  async function update(next: Partial<ClientPrefs>) {
    let prev: ClientPrefs | null = null;

    setPrefs((p) => {
      prev = p;
      return { ...p, ...next } as ClientPrefs;
    });

    onToast?.("Saving…");

    const merged = { ...prefs, ...next } as ClientPrefs;

    try {
      await apiFetch("/api/client/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(merged),
      });

      localStorage.setItem(storageKey(clientId), JSON.stringify(merged));
      onToast?.("Salvat");
    } catch {
      if (prev) setPrefs(prev);
      onToast?.("Could not save");
    }
  }

  return { prefs, setPrefs, hydrated, defaultPrefs, update };
}