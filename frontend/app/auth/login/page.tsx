"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch, setAccessToken } from "@/app/_lib/authClient";
import { useToast } from "@/app/components/ui/toast/ToastProvider";
import AuthShell from "../components/AuthShell";
import PasswordField from "../components/PasswordField";
import RoleSelector from "../components/RoleSelector";
import SessionGate from "../components/SessionGate";
import { useSessionRedirect } from "../hooks/useSessionRedirect";

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();

  const [requestedRole] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    return params.get("role");
  });

  const [role, setRole] = useState<"therapist" | "client">(() => {
    if (typeof window === "undefined") return "therapist";
    const params = new URLSearchParams(window.location.search);
    return params.get("role") === "client" ? "client" : "therapist";
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    isCheckingSession,
    showSessionLoader,
    sessionNotice,
    sessionNoticeProgress,
  } = useSessionRedirect();

  useEffect(() => {
    if (requestedRole === "client") {
      setRole("client");
      return;
    }
    if (requestedRole === "therapist") {
      setRole("therapist");
    }
  }, [requestedRole]);

  const copy = useMemo(() => {
    if (role === "therapist") {
      return {
        title: "Autentifică-te în spațiul tău de terapeut",
        subtitle:
          "Continuă de unde ai rămas: ședințe, notițe, clienți și continuitate într-un singur loc calm.",
        primaryCta: "Autentifică-te ca terapeut",
      };
    }

    return {
      title: "Autentifică-te în spațiul tău de client",
      subtitle:
        "Continuă reflecțiile tale și rămâi conectat(ă) între ședințe, privat și în ritmul tău.",
      primaryCta: "Autentifică-te ca client",
    };
  }, [role]);

  if (isCheckingSession) {
    return (
      <SessionGate
        sessionNotice={sessionNotice}
        sessionNoticeProgress={sessionNoticeProgress}
        showSessionLoader={showSessionLoader}
      />
    );
  }

  return (
    <AuthShell title={copy.title} subtitle={copy.subtitle} footer={
      <>
        <span>Nu ai cont?</span>{" "}
        <Link href={`/auth/signup?role=${role}`} className="font-medium text-(--color-accent) hover:opacity-90">
          Înregistrează-te
        </Link>
      </>
    }>
      <RoleSelector role={role} onChange={setRole} />

      <form
        className="space-y-5"
        onSubmit={async (e) => {
          e.preventDefault();
          setIsSubmitting(true);

          try {
            const data = await apiFetch("/api/auth/login", {
              method: "POST",
              body: JSON.stringify({
                email: email.trim().toLowerCase(),
                password,
                rememberMe,
              }),
            });

            setAccessToken(data.accessToken);
            const user = data.user;

            try {
              localStorage.setItem("innery_user", JSON.stringify(user));
            } catch {}

            setTimeout(() => {
              if (user?.role === "therapist") {
                router.push(`/therapist/${user.id}`);
              } else {
                router.push(`/client`);
              }
            }, 50);
          } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : "Autentificare eșuată.");
          } finally {
            setIsSubmitting(false);
          }
        }}
      >
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-(--color-accent)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">Parolă</label>
            <Link href="/auth/forgot-password" className="text-xs font-medium text-(--color-accent) hover:opacity-90">
              Ai uitat?
            </Link>
          </div>
          <PasswordField
            label=""
            value={password}
            onChange={setPassword}
            placeholder="Introdu parola"
            show={showPassword}
            onToggle={() => setShowPassword((v) => !v)}
            autoComplete="current-password"
          />
        </div>

        <label className="flex items-center gap-3 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded border border-gray-300 accent-(--color-accent)"
          />
          <span>Menține-mă autentificat(ă) 30 de zile</span>
        </label>

        <button
          type="submit"
          className="mt-2 w-full rounded-xl bg-(--color-accent) px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Se autentifică..." : copy.primaryCta}
        </button>

        <p className="text-xs text-gray-500/90">Contul tău este protejat prin autentificare sigură.</p>
      </form>
    </AuthShell>
  );
}
