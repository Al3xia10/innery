// The new file content
"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/app/_lib/authClient";

type SessionStatus = "Scheduled" | "Completed" | "Canceled" | "NoShow";

type Session = {
  id: string;
  therapistId: string;
  clientUserId: string;
  startsAt: string;
  status: SessionStatus;
  type?: "Individual" | "Couple" | "Group";
};

type Client = {
  id: string;
  name: string;
  email?: string;
};

function toNiceDate(raw: string) {
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}


function getSessionTypeLabel(type?: Session["type"]) {
  if (type === "Couple") return "Cuplu";
  if (type === "Group") return "Grup";
  return "Individuală";
}

export default function TherapistDashboard() {
  const params = useParams() as { therapistId?: string };
  const router = useRouter();
  const therapistId = (params?.therapistId as string) ?? "t1";

  const [clients, setClients] = React.useState<Client[]>([]);
  const [sessions, setSessions] = React.useState<Session[]>([]);
  const [notesCount, setNotesCount] = React.useState<number | null>(null);
  const [notesCountLoading, setNotesCountLoading] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [therapistName, setTherapistName] = React.useState<string>(therapistId);
  const [accessToast, setAccessToast] = React.useState<string | null>(null);

    React.useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);

        const me = await apiFetch("/api/me", { method: "GET" });
        const meUser = me?.user ?? me;
        const meRole = meUser?.role;
        const meId = meUser?.id != null ? String(meUser.id) : null;
        const meName = meUser?.name;

        if (meRole !== "therapist") {
          const message = "Nu ai acces la workspace-ul terapeutului.";

          try {
            localStorage.setItem("innery_redirect_notice", message);
          } catch {}

          if (alive) {
            setAccessToast(message);
            setLoading(false);
          }

          window.setTimeout(() => {
            router.replace(meRole === "client" ? "/client" : "/");
          }, 1400);
          return;
        }

        if (meId && meId !== therapistId) {
          const message = "Ai fost redirecționată către workspace-ul tău de terapeut.";

          try {
            localStorage.setItem("innery_redirect_notice", message);
          } catch {}

          if (alive) {
            setAccessToast(message);
            setLoading(false);
          }

          window.setTimeout(() => {
            router.replace(`/therapist/${meId}`);
          }, 5400);
          return;
        }

        if (alive && typeof meName === "string" && meName.trim()) {
          setTherapistName(meName);
        }

        const clientsData = await apiFetch(`/api/therapists/${therapistId}/clients`, {
          method: "GET",
        });

        const nextClients: Client[] = (clientsData?.clients ?? [])
          .filter((c: any) => c.kind === "linked")
          .map((c: any) => ({
            id: String(c.user?.id),
            name: String(c.user?.name ?? "Client"),
            email: String(c.user?.email ?? ""),
          }));

        const sessionsData = await apiFetch(`/api/therapists/${therapistId}/sessions`, {
          method: "GET",
        });

        const nextSessions: Session[] = (sessionsData?.sessions ?? []).map((s: any) => ({
          id: String(s.id),
          therapistId: String(s.therapistId),
          clientUserId: String(s.clientUserId),
          startsAt: String(s.startsAt),
          status: (s.status ?? "Scheduled") as SessionStatus,
          type: s.type ?? "Individual",
        }));

        try {
          if (alive) setNotesCountLoading(true);
          const notesData = await apiFetch(`/api/therapists/${therapistId}/notes`, {
            method: "GET",
          });
          const count = Array.isArray(notesData?.notes) ? notesData.notes.length : null;
          if (alive) setNotesCount(typeof count === "number" ? count : null);
        } catch {
          if (alive) setNotesCount(null);
        } finally {
          if (alive) setNotesCountLoading(false);
        }

        if (alive) {
          setClients(nextClients);
          setSessions(nextSessions);
        }
      } catch (e) {
        console.error("Panou load error", e);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [router, therapistId]);
    React.useEffect(() => {
    try {
      const rawNotice = localStorage.getItem("innery_redirect_notice");
      if (!rawNotice) return;

      setAccessToast(rawNotice);
      localStorage.removeItem("innery_redirect_notice");

      const timeout = window.setTimeout(() => {
        setAccessToast(null);
      }, 3200);

      return () => {
        window.clearTimeout(timeout);
      };
    } catch {}
  }, []);

  const displayTherapistName = therapistName || therapistId;

  const scheduledSorted = sessions
    .filter((s) => s.status === "Scheduled")
    .slice()
    .sort((a, b) => {
      const da = new Date(a.startsAt).getTime();
      const db = new Date(b.startsAt).getTime();
      if (Number.isNaN(da) || Number.isNaN(db)) {
        return String(a.startsAt).localeCompare(String(b.startsAt));
      }
      return da - db;
    });

  const todayCount = sessions.filter((s) => {
    const d = new Date(s.startsAt);
    const now = new Date();
    return (
      !Number.isNaN(d.getTime()) &&
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate() &&
      s.status === "Scheduled"
    );
  }).length;


  

  const todos = (() => {
    const items: { title: string; tone: "info" | "warn" | "ok"; href?: string }[] = [];

    if (todayCount > 0) {
      items.push({
        title: `Ai ${todayCount} ședinț${todayCount === 1 ? "ă" : "e"} astăzi`,
        tone: "info",
        href: `/therapist/${therapistId}/sessions`,
      });
    }

    if (scheduledSorted[0]) {
      const upcomingClient = clients.find((c) => c.id === scheduledSorted[0].clientUserId);
      items.push({
        title: `Următoarea ședință: ${upcomingClient?.name ?? "Client"}`,
        tone: "info",
        href: `/therapist/${therapistId}/sessions`,
      });
    } else {
      items.push({
        title: "Nu există încă ședințe programate",
        tone: "ok",
        href: `/therapist/${therapistId}/sessions`,
      });
    }

    if (clients.length === 0) {
      items.push({
        title: "Invită primul tău client",
        tone: "warn",
        href: `/therapist/${therapistId}/clients`,
      });
    }

    if (notesCount == null) {
      items.push({
        title: "Contorul pentru notițe nu este disponibil încă",
        tone: "ok",
        href: `/therapist/${therapistId}/notes`,
      });
    }

    return items.slice(0, 4);
  })();

  const activeClientsCount = clients.length;
  const pendingReviewsCount = Math.max(0, Math.min(9, todayCount + (notesCount == null ? 1 : 0)));



    const todayAgenda = scheduledSorted.filter((s) => {
    const d = new Date(s.startsAt);
    const now = new Date();
    return (
      !Number.isNaN(d.getTime()) &&
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  });


  const quickActions = [
    {
      title: "Adaugă client nou",
      subtitle: "Invită pe cineva în workspace-ul tău",
      href: `/therapist/${therapistId}/clients`,
    },
    {
      title: "Programează ședință",
      subtitle: "Deschide programul și planifică din timp",
      href: `/therapist/${therapistId}/sessions`,
    },
    {
      title: "Vezi datele clientului",
      subtitle: "Intră rapid în profiluri și progres",
      href: `/therapist/${therapistId}/clients`,
    },
    {
      title: "Scrie rezumatul săptămânal",
      subtitle: "Notează observațiile și ideile importante",
      href: `/therapist/${therapistId}/notes`,
    },
  ];


  return (
  <section className="min-h-screen px-3 py-3 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
    {accessToast ? (
        <div className="fixed inset-x-4 top-4 z-50 flex justify-center sm:inset-x-0">
          <div className="w-full max-w-md rounded-[20px] border border-(--color-soft) bg-white px-4 py-4 shadow-[0_18px_40px_rgba(31,23,32,0.14)] ring-2 ring-(--color-soft) sm:rounded-[28px] sm:px-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[18px] bg-(--color-soft) text-(--color-primary) sm:rounded-full">
                <span className="text-base font-semibold">i</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Notificare acces</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">{accessToast}</p>
                <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.16em] text-(--color-primary)">
                  Redirecționare...
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      <div className="w-full px-1 pb-16 pt-3 sm:px-6 lg:px-10 lg:pt-10">
        <div className="space-y-5 lg:mx-auto lg:max-w-5xl lg:space-y-8">
        <header className="space-y-6">
          <div className="px-1 sm:px-2 lg:px-1">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,#e7edf8_0%,#f2e8ff_100%)] text-sm font-semibold text-slate-700 shadow-sm sm:rounded-full">
                  {initials(displayTherapistName)}
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-(--color-primary)">
                    bine ai revenit
                  </p>
                  <h1 className="mt-1 text-[1.45rem] font-semibold leading-none tracking-tight text-slate-900 sm:text-[1.7rem]">
                    {displayTherapistName}
                  </h1>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 px-0 sm:px-2 lg:px-1">
            <div className="space-y-3">
              <p className="w-full text-[2rem] font-semibold leading-[1.02] tracking-tight text-slate-900 sm:text-[1.8rem]">
                Cum arată ziua ta astăzi?
              </p>
            </div>

            <div className="w-full rounded-[28px] bg-[linear-gradient(135deg,var(--color-warm)_0%,var(--color-accent)_50%,var(--color-primary)_100%)] p-5 text-white shadow-[0_28px_60px_rgba(184,104,152,0.24)] sm:rounded-[36px] sm:p-7">
              <div className="inline-flex rounded-[18px] bg-white/40 px-3 py-1 text-[11px] font-semibold text-white sm:rounded-full">
                privire de ansamblu
              </div>

              <h2 className="mt-4 max-w-none text-[1.8rem] font-semibold leading-[1.03] tracking-tight text-white sm:max-w-none sm:text-[1.9rem]">
                Tot ce ai nevoie pentru azi
              </h2>
              <p className="mt-2 max-w-[28ch] text-[0.95rem] leading-6 text-white/88 sm:max-w-none sm:text-sm">
                Verifică rapid ce ai azi în focus.
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                <div className="rounded-[20px] bg-white/60 px-4 py-3.5 backdrop-blur-sm ring-1 ring-white/20 sm:rounded-3xl">
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-gray-700">Azi</p>
                  <p className="mt-2 text-[1.3rem] font-semibold leading-none text-gray-700">{todayCount}</p>
                  <p className="mt-1.5 text-xs text-gray-700">sesiuni</p>
                </div>

                <div className="rounded-[20px] bg-white/60 px-4 py-3.5 backdrop-blur-sm ring-1 ring-white/20 sm:rounded-3xl">
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-gray-700">Clienti</p>
                  <p className="mt-2 text-[1.3rem] font-semibold leading-none text-gray-700">{activeClientsCount}</p>
                  <p className="mt-1.5 text-xs text-gray-700">activi</p>
                </div>

                <div className="col-span-2 rounded-[20px] bg-white/60 px-4 py-3.5 backdrop-blur-sm ring-1 ring-white/20 sm:rounded-3xl sm:col-span-1">
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-gray-700">Note</p>
                  <p className="mt-2 text-[1.3rem] font-semibold leading-none text-gray-700">
                    {notesCountLoading ? "..." : String(notesCount ?? 0)}
                  </p>
                  <p className="mt-1.5 text-xs text-gray-700">în workspace</p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2.5 md:grid-cols-2">
                <Link
                  href={`/therapist/${therapistId}/sessions`}
                  className="inline-flex min-h-11 items-center justify-center rounded-[18px] bg-white px-4 py-3 text-center text-sm font-semibold leading-5 text-[#9a5d77] shadow-[0_14px_28px_rgba(255,255,255,0.22)] transition hover:-translate-y-px hover:opacity-95 sm:px-5"
                >
                  Vezi programul
                </Link>

                <Link
                  href={`/therapist/${therapistId}/clients`}
                  className="inline-flex min-h-11 items-center justify-center rounded-[18px] bg-white/90 px-4 py-3 text-center text-sm font-semibold leading-5 text-[#9a5d77] shadow-[0_10px_20px_rgba(255,255,255,0.14)] transition hover:-translate-y-px hover:opacity-95 sm:px-5"
                >
                  Clients
                </Link>
              </div>
            </div>
          </div>
        </header>
        <div className="space-y-6">
          <section
            className="overflow-hidden rounded-[28px] border border-black/5 shadow-sm sm:rounded-[36px]"
            style={{
              background:
                "linear-gradient(135deg, #ffffff 0%, rgba(239,208,202,0.18) 60%, rgba(125,128,218,0.08) 100%)",
            }}
          >
            <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-7">
              <div>
                <p className="text-sm font-semibold text-slate-900">Astăzi</p>
                <p className="mt-1 text-sm text-[#6B5A63]">
                  Sesiunile zilei și următorii pași, într-un format clar și ușor de urmărit.
                </p>
              </div>
              <Link
                href={`/therapist/${therapistId}/sessions`}
                className="shrink-0 inline-flex min-h-10 w-full sm:w-auto items-center justify-center rounded-[18px] border border-black/5 bg-(--color-card) px-3 py-2 text-sm font-semibold text-slate-900 shadow-[0_4px_10px_rgba(31,23,32,0.05)] transition hover:bg-(--color-soft)"
              >
                Vezi tot programul
              </Link>
            </div>

            <div className="px-5 pb-5 sm:px-7 sm:pb-7">
              {loading ? (
                <div className="rounded-[20px] border border-black/5 bg-(--color-card) p-4 sm:rounded-[28px] sm:p-5">
                  <div className="space-y-3">
                    <div className="h-24 rounded-[20px] bg-[#f1eff8] sm:rounded-3xl" />
                    <div className="h-24 rounded-[20px] bg-[#f1eff8] sm:rounded-3xl" />
                    <div className="h-24 rounded-[20px] bg-[#f1eff8] sm:rounded-3xl" />
                  </div>
                </div>
              ) : todayAgenda.length === 0 ? (
                <div className="rounded-2xl border border-black/5 bg-(--color-card) p-5">
                  <p className="text-sm font-semibold text-slate-900">Nu ai sesiuni azi</p>
                  <p className="mt-2 text-sm leading-6 text-[#6B5A63]">
                    Poți folosi timpul pentru a revizui notițele, clienții sau programările viitoare.
                  </p>
                  <div className="mt-4">
                    <Link
                      href={`/therapist/${therapistId}/sessions`}
                      className="inline-flex min-h-11 w-full items-center justify-center rounded-[18px] bg-(--color-accent) px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 sm:w-auto"
                    >
                      Deschide programul
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-black/5 bg-(--color-card) p-5">
                  <div className="space-y-3">
                    {todayAgenda.slice(0, 2).map((session) => {
                      const client = clients.find((c) => c.id === session.clientUserId);
                      return (
                        <article
                          key={session.id}
                          className="rounded-[20px] border border-black/5 bg-white px-4 py-4 shadow-[0_4px_12px_rgba(31,23,32,0.04)] sm:rounded-3xl"
                        >
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="min-w-0 flex items-center gap-3">
                              <div className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-white text-sm font-semibold text-slate-900 ring-1 ring-(--color-soft) sm:rounded-[20px]">
                                {initials(client?.name ?? "C")}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-slate-900">
                                  {client?.name ?? "Client necunoscut"}
                                </p>
                                <p className="mt-1 text-xs leading-6 text-slate-500">
                                  {getSessionTypeLabel(session.type)} • {toNiceDate(session.startsAt)}
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 sm:w-auto sm:flex sm:flex-wrap sm:justify-end">
                              <Link
                                href={`/therapist/${therapistId}/clients/${session.clientUserId}`}
                                className="inline-flex min-h-10 items-center justify-center rounded-[18px] border border-black/5 bg-(--color-card) px-3 py-2 text-[11px] font-semibold text-slate-700 transition hover:bg-(--color-soft)"
                              >
                                Deschide clientul
                              </Link>
                              <Link
                                href={`/therapist/${therapistId}/notes`}
                                className="inline-flex min-h-10 items-center justify-center rounded-[18px] bg-(--color-accent) px-3 py-2 text-[11px] font-semibold text-white transition hover:opacity-95"
                              >
                                Scrie notiță
                              </Link>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>

                  <div className="mt-4">
                    <Link
                      href={`/therapist/${therapistId}/sessions`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-(--color-primary) hover:underline"
                    >
                      <span>Vezi tot programul</span>
                      <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                        <path fillRule="evenodd" d="M7.22 4.97a.75.75 0 0 1 1.06 0l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 1 1-1.06-1.06L11.19 10 7.22 6.03a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                      </svg>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </section>
          <section
            className="overflow-hidden rounded-[28px] border border-black/5 shadow-sm sm:rounded-[36px]"
            style={{
              background:
                "linear-gradient(135deg, #ffffff 0%, rgba(239,208,202,0.18) 60%, rgba(125,128,218,0.08) 100%)",
            }}
          >
            <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-7">
              <div>
                <p className="text-sm font-semibold text-slate-900">Acțiuni rapide</p>
                <p className="mt-1 text-sm text-[#6B5A63]">
                  Intrări rapide către zonele pe care le folosești cel mai des în workspace.
                </p>
              </div>
              <Link
                href={`/therapist/${therapistId}/clients`}
                className="shrink-0 inline-flex min-h-10 w-full sm:w-auto items-center justify-center rounded-[18px] border border-black/5 bg-(--color-card) px-3 py-2 text-sm font-semibold text-slate-900 shadow-[0_4px_10px_rgba(31,23,32,0.05)] transition hover:bg-(--color-soft)"
              >
                Vezi clienții
              </Link>
            </div>

            <div className="px-5 pb-5 sm:px-7 sm:pb-7">
             <div className="rounded-[20px] border border-black/5 bg-(--color-card) p-4 sm:rounded-[28px] sm:p-5">
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {quickActions.map((action) => (
                    <Link
                      key={action.title}
                      href={action.href}
                      className="flex min-h-22 items-center justify-between rounded-[20px] border border-black/5 bg-white px-4 py-4 shadow-[0_4px_12px_rgba(31,23,32,0.04)] transition hover:bg-(--color-card) sm:rounded-3xl"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{action.title}</p>
                        <p className="mt-1 text-xs leading-6 text-slate-500">{action.subtitle}</p>
                      </div>
                      <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 shrink-0 text-(--color-accent)">
                        <path fillRule="evenodd" d="M7.22 4.97a.75.75 0 0 1 1.06 0l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 1 1-1.06-1.06L11.19 10 7.22 6.03a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                      </svg>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
      </div>
    </section>
  );
}


function PanelCard({
  title,
  subtitle,
  tone,
  children,
  actionHref,
}: {
  title: string;
  subtitle: string;
  tone: "light" | "mint";
  children: React.ReactNode;
  actionHref?: string;
}) {
  return (
    <div
      className={`rounded-[28px] border p-4 shadow-[0_10px_24px_rgba(31,29,26,0.05)] sm:rounded-[36px] sm:p-7 ${
        tone === "mint"
          ? "border-[#dcd7ff] bg-[#5b4ce6] text-white"
          : "border-[#e3e0ef] bg-[#fcfbff] text-slate-900"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className={`text-xl font-semibold tracking-tight ${tone === "mint" ? "text-white" : "text-slate-900"}`}>
            {title}
          </h2>
          <p className={`mt-1 text-sm ${tone === "mint" ? "text-white/80" : "text-slate-500"}`}>{subtitle}</p>
        </div>
        {actionHref ? (
          <Link
            href={actionHref}
            className={`text-sm font-semibold ${tone === "mint" ? "text-white" : "text-[#5b4ce6]"}`}
          >
            Vezi tot
          </Link>
        ) : null}
      </div>
      {children}
    </div>
  );
}

function EmptySoftState({
  title,
  description,
  href,
  cta,
}: {
  title: string;
  description: string;
  href?: string;
  cta?: string;
}) {
  return (
    <div className="mt-5 rounded-[20px] border border-dashed border-[#ddd8ea] bg-[#f8f7fc] p-5 text-center sm:rounded-[28px] sm:p-8">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
      {href && cta ? (
        <Link
          href={href}
          className="mt-4 inline-flex min-h-11 w-full sm:w-auto items-center justify-center rounded-[18px] bg-[#5b4ce6] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4d3fde]"
        >
          {cta}
        </Link>
      ) : null}
    </div>
  );
}


function AlertSoftRow({
  title,
  tone,
  href,
}: {
  title: string;
  tone: "info" | "warn" | "ok";
  href?: string;
}) {
  const toneClass =
    tone === "warn"
      ? "bg-amber-50 border-amber-100"
      : tone === "info"
      ? "bg-[#ece9ff] border-[#d9d5ff]"
      : "bg-emerald-50 border-emerald-100";

  const badgeClass =
    tone === "warn"
      ? "bg-amber-100 text-amber-800"
      : tone === "info"
      ? "bg-white text-[#5b4ce6]"
      : "bg-emerald-100 text-emerald-800";

  const content = (
    <div className={`flex items-center justify-between gap-3 rounded-[20px] border px-4 py-3 sm:rounded-3xl ${toneClass}`}>
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <span className={`rounded-[18px] px-2.5 py-1 text-[11px] font-semibold sm:rounded-full ${badgeClass}`}>
        {tone === "warn" ? "Important" : tone === "info" ? "Info" : "Bine"}
      </span>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}


