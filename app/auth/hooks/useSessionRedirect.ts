"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/app/_lib/authClient";

type Role = "therapist" | "client";

export function useSessionRedirect() {
  const router = useRouter();
  const [isCheckingSession, setIsCheckingSession] = React.useState(true);
  const [showSessionLoader, setShowSessionLoader] = React.useState(false);
  const [sessionNotice, setSessionNotice] = React.useState<string | null>(null);
  const [sessionNoticeProgress, setSessionNoticeProgress] = React.useState(100);

  React.useEffect(() => {
    let cancelled = false;

    const checkSession = async () => {
      const requestedRoleFromUrl =
        typeof window !== "undefined"
          ? (new URLSearchParams(window.location.search).get("role") as Role | null)
          : null;

      try {
        const rawUser = localStorage.getItem("innery_user");

        if (!rawUser) {
          if (!cancelled) setIsCheckingSession(false);
          return;
        }

        const me = await apiFetch("/api/me");
        if (cancelled) return;

        const user = me?.user ?? me;

        if (user?.role === "therapist" && user?.id) {
          if (requestedRoleFromUrl === "client") {
            setSessionNotice(
              "Ești deja autentificat(ă) ca terapeut. Te redirecționăm către spațiul tău de terapeut..."
            );
            setSessionNoticeProgress(100);
            window.setTimeout(() => {
              router.replace(`/therapist/${user.id}`);
            }, 2800);
          } else {
            router.replace(`/therapist/${user.id}`);
          }
          return;
        }

        if (user?.role === "client") {
          if (requestedRoleFromUrl === "therapist") {
            setSessionNotice(
              "Ești deja autentificat(ă) ca client. Te redirecționăm către spațiul tău de client..."
            );
            setSessionNoticeProgress(100);
            window.setTimeout(() => {
              router.replace(`/client`);
            }, 2800);
          } else {
            router.replace(`/client`);
          }
          return;
        }
      } catch {
        try {
          localStorage.removeItem("innery_user");
          localStorage.removeItem("innery_token");
        } catch {}
      }

      if (!cancelled) setIsCheckingSession(false);
    };

    checkSession();

    return () => {
      cancelled = true;
    };
  }, [router]);

  React.useEffect(() => {
    if (!isCheckingSession) {
      setShowSessionLoader(false);
      return;
    }

    if (sessionNotice) {
      setShowSessionLoader(false);
      return;
    }

    const timeout = window.setTimeout(() => {
      setShowSessionLoader(true);
    }, 180);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [isCheckingSession, sessionNotice]);

  React.useEffect(() => {
    if (!sessionNotice) {
      setSessionNoticeProgress(100);
      return;
    }

    setSessionNoticeProgress(100);
    const totalDuration = 2800;
    const intervalMs = 40;
    const startedAt = Date.now();

    const interval = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const next = Math.max(0, 100 - (elapsed / totalDuration) * 100);
      setSessionNoticeProgress(next);
    }, intervalMs);

    return () => {
      window.clearInterval(interval);
    };
  }, [sessionNotice]);

  return {
    isCheckingSession,
    showSessionLoader,
    sessionNotice,
    sessionNoticeProgress,
  };
}
