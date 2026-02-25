"use client";

import * as React from "react";
import { apiFetch } from "./authClient";

export function useMe() {
  const [me, setMe] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiFetch("/api/me", { method: "GET" });
        if (!alive) return;
        setMe(data?.user ?? null);
      } catch (e: any) {
        if (!alive) return;
        setMe(null);
        setError(e?.message ?? "Eroare la /api/me");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return { me, loading, error };
}