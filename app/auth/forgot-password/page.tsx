"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/app/_lib/authClient";
import { useToast } from "@/app/components/ui/toast/ToastProvider";
import AuthShell from "../components/AuthShell";
import PasswordField from "../components/PasswordField";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

  const token = searchParams.get("token")?.trim() || "";
  const isResetMode = Boolean(token);

  const [email, setEmail] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  async function onRequestReset(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const data = await apiFetch("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      setMessage(
        data?.message ||
          "Dacă există cont pe acest email, vei primi un link pentru resetarea parolei."
      );
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Nu am putut procesa cererea.");
    } finally {
      setSubmitting(false);
    }
  }

  async function onResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    if (newPassword.length < 8) {
      setSubmitting(false);
      toast.error("Parola nouă trebuie să aibă cel puțin 8 caractere.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setSubmitting(false);
      toast.error("Parolele nu coincid.");
      return;
    }

    try {
      const data = await apiFetch("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, newPassword }),
      });
      const successMsg = data?.message || "Parola a fost schimbată cu succes.";
      setMessage(successMsg);
      toast.success(successMsg);
      window.setTimeout(() => {
        router.push("/auth/login");
      }, 1200);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Nu am putut reseta parola.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title={isResetMode ? "Setează parola nouă" : "Ai uitat parola?"}
      subtitle={
        isResetMode
          ? "Introdu parola nouă pentru contul tău."
          : "Introdu email-ul contului și îți trimitem un link de resetare."
      }
      footer={
        <Link href="/auth/login" className="font-medium text-(--color-accent) hover:opacity-90">
          Înapoi la autentificare
        </Link>
      }
    >
      {!isResetMode ? (
        <form className="space-y-4" onSubmit={onRequestReset}>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-(--color-accent)"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-(--color-accent) px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? "Se trimite..." : "Trimite link de resetare"}
          </button>
        </form>
      ) : (
        <form className="space-y-4" onSubmit={onResetPassword}>
          <PasswordField
            label="Parolă nouă"
            value={newPassword}
            onChange={setNewPassword}
            placeholder="Minim 8 caractere"
            show={showNewPassword}
            onToggle={() => setShowNewPassword((v) => !v)}
            minLength={8}
            autoComplete="new-password"
          />

          <PasswordField
            label="Confirmă parola nouă"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Repetă parola nouă"
            show={showConfirmPassword}
            onToggle={() => setShowConfirmPassword((v) => !v)}
            minLength={8}
            autoComplete="new-password"
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-(--color-accent) px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? "Se salvează..." : "Schimbă parola"}
          </button>
        </form>
      )}

      {message ? (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}
    </AuthShell>
  );
}
