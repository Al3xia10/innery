"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch, setAccessToken } from "@/app/_lib/authClient";
import { useToast } from "@/app/components/ui/toast/ToastProvider";
import AuthShell from "../components/AuthShell";
import PasswordField from "../components/PasswordField";
import RoleSelector from "../components/RoleSelector";
import SessionGate from "../components/SessionGate";
import { useSessionRedirect } from "../hooks/useSessionRedirect";

export default function SignupPage() {
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

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
        title: "Creează-ți contul de terapeut",
        subtitle: "Organizează ședințele, notițele și progresul clientului într-un spațiu privat.",
        cta: "Creează cont de terapeut",
      };
    }
    return {
      title: "Creează-ți contul de client",
      subtitle: "Un spațiu calm și privat pentru reflecții și progres comun cu terapeutul tău.",
      cta: "Creează cont de client",
    };
  }, [role]);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();

      await apiFetch("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          role,
          name: name.trim(),
          email: normalizedEmail,
          password,
        }),
      });

      const data = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: normalizedEmail, password, rememberMe: false }),
      });

      setAccessToken(data.accessToken);
      try {
        localStorage.setItem("innery_user", JSON.stringify(data.user));
      } catch {}

      if (data.user?.role === "therapist") {
        router.push(`/therapist/${data.user.id}`);
      } else {
        router.push(`/client`);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Înregistrare eșuată.");
    } finally {
      setIsSubmitting(false);
    }
  }

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
    <AuthShell
      title={copy.title}
      subtitle={copy.subtitle}
      footer={
        <>
          <span>Ai deja cont?</span>{" "}
          <Link href={`/auth/login?role=${role}`} className="font-medium text-(--color-accent) hover:opacity-90">
            Autentificare
          </Link>
        </>
      }
    >
      <RoleSelector role={role} onChange={setRole} />

      <form className="space-y-4" onSubmit={handleSignup}>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Nume complet</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Numele tău complet"
            className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-accent)"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-accent)"
          />
        </div>

        <PasswordField
          label="Parolă"
          value={password}
          onChange={setPassword}
          placeholder="Creează o parolă"
          show={showPassword}
          onToggle={() => setShowPassword((v) => !v)}
          minLength={8}
          autoComplete="new-password"
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-4 w-full rounded-xl bg-(--color-accent) py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          {isSubmitting ? "Se creează..." : copy.cta}
        </button>
      </form>
    </AuthShell>
  );
}
