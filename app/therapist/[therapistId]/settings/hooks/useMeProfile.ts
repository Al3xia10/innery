

"use client";

import * as React from "react";
import { apiFetch } from "@/app/_lib/authClient";

export type MeUser = { id: number; role: string; name: string; email: string };

export function useMeProfile({ onToast }: { onToast?: (msg: string) => void }) {
  const [meLoading, setMeLoading] = React.useState(true);
  const [meError, setMeError] = React.useState<string | null>(null);
  const [meUser, setMeUser] = React.useState<MeUser | null>(null);

  const [editingProfile, setEditingProfile] = React.useState(false);
  const [draftName, setDraftName] = React.useState("");
  const [draftEmail, setDraftEmail] = React.useState("");
  const [profileSaving, setProfileSaving] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;

    async function fetchMe() {
      setMeLoading(true);
      setMeError(null);
      try {
        const me = await apiFetch("/api/me", { method: "GET" });
        if (!me || !(me as any).user) throw new Error("No user found");
        if (cancelled) return;

        const u = (me as any).user as MeUser;
        setMeUser(u);
        setDraftName(u.name ?? "");
        setDraftEmail(u.email ?? "");
      } catch (err: any) {
        if (cancelled) return;
        setMeError(err?.message || "Failed to load profile");
      } finally {
        if (!cancelled) setMeLoading(false);
      }
    }

    fetchMe();
    return () => {
      cancelled = true;
    };
  }, []);

  function openProfileEdit() {
    if (!meUser) return;
    setEditingProfile(true);
    setDraftName(meUser.name ?? "");
    setDraftEmail(meUser.email ?? "");
  }

  function cancelProfileEdit() {
    if (!meUser) return;
    setEditingProfile(false);
    setDraftName(meUser.name ?? "");
    setDraftEmail(meUser.email ?? "");
  }

  async function saveProfileEdit() {
    const name = draftName.trim();
    const email = draftEmail.trim();

    if (!name || !email) {
      onToast?.("Please fill name + email");
      return;
    }

    setProfileSaving(true);
    try {
      const data = await apiFetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      if (!data || !(data as any).user) throw new Error("No user returned");
      setMeUser((data as any).user as MeUser);
      setEditingProfile(false);
      onToast?.("Saved");
    } catch (err: any) {
      onToast?.(err?.message || "Failed to update profile");
    } finally {
      setProfileSaving(false);
    }
  }

  return {
    meLoading,
    meError,
    meUser,
    setMeUser,

    editingProfile,
    draftName,
    setDraftName,
    draftEmail,
    setDraftEmail,
    profileSaving,

    openProfileEdit,
    cancelProfileEdit,
    saveProfileEdit,
  };
}