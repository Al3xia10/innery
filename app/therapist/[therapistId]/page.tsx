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
  if (type === "Couple") return "Couple";
  if (type === "Group") return "Group";
  return "Individual";
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
          const message = "You don’t have access to the therapist workspace.";

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
          const message = "You’ve been redirected to your therapist workspace.";

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
        console.error("Dashboard load error", e);
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
        title: `You have ${todayCount} session${todayCount === 1 ? "" : "s"} today`,
        tone: "info",
        href: `/therapist/${therapistId}/sessions`,
      });
    }

      if (scheduledSorted[0]) {
    const upcomingClient = clients.find((c) => c.id === scheduledSorted[0].clientUserId);

    items.push({
      title: `Next session: ${upcomingClient?.name ?? "Client"}`,
      tone: "info",
      href: `/therapist/${therapistId}/sessions`,
    });
  } else {
    items.push({
      title: "No scheduled sessions yet",
      tone: "ok",
      href: `/therapist/${therapistId}/sessions`,
    });
  }

    if (clients.length === 0) {
      items.push({
        title: "Invite your first client",
        tone: "warn",
        href: `/therapist/${therapistId}/clients`,
      });
    }

    if (notesCount == null) {
      items.push({
        title: "Notes counter not available yet",
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
      title: "Add new client",
      subtitle: "Invite someone to your workspace",
      href: `/therapist/${therapistId}/clients`,
    },
    {
      title: "Assign session",
      subtitle: "Open the schedule and plan ahead",
      href: `/therapist/${therapistId}/sessions`,
    },
    {
      title: "View client data",
      subtitle: "Jump into profiles and progress",
      href: `/therapist/${therapistId}/clients`,
    },
    {
      title: "Write weekly summary",
      subtitle: "Capture notes and key observations",
      href: `/therapist/${therapistId}/notes`,
    },
  ];


  return (
  <section className="min-h-screen p-2 sm:p-6 lg:p-8">
    {accessToast ? (
        <div className="fixed inset-x-4 top-4 z-50 flex justify-center sm:inset-x-0">
          <div className="w-full max-w-md rounded-3xl border border-(--color-soft) bg-white px-5 py-4 shadow-[0_18px_40px_rgba(31,23,32,0.14)] ring-2 ring-(--color-soft)">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-(--color-soft) text-(--color-primary)">
                <span className="text-base font-semibold">i</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Access notice</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">{accessToast}</p>
                <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.16em] text-(--color-primary)">
                  Redirecting...
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    <div className="mx-auto max-w-6xl space-y-4 sm:space-y-6">
        <div className="rounded-3xl border border-[#e7e6f2] bg-[#f8f7fc] px-4 py-5 shadow-[0_14px_32px_rgba(31,29,26,0.06)] sm:rounded-[34px] sm:px-8 sm:py-8 lg:px-10">
          <div className="max-w-3xl space-y-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d9d5ff] bg-white px-3 py-1 text-[11px] font-semibold text-[#5b4ce6] shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[#5b4ce6]" />
              workspace overview
            </div>
            <h1 className="mt-4 text-[1.85rem] font-semibold tracking-tight text-slate-900 sm:mt-5 sm:text-4xl">
              Bună, {displayTherapistName}
            </h1>
            <p className="mt-3 max-w-2xl text-[14px] leading-7 text-slate-500 sm:text-base">
              Aici vezi doar lucrurile importante pentru ziua de azi: programul, ce are nevoie de atenție și intrările rapide către paginile utile.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] font-medium text-slate-500 sm:mt-5 sm:text-xs">
              <span className="rounded-full bg-white px-2.5 py-1 shadow-sm">{todayCount} sesiuni azi</span>
              <span className="rounded-full bg-[#ece9ff] px-2.5 py-1 text-[#5b4ce6]">{activeClientsCount} clienți activi</span>
              <span className="rounded-full bg-white px-2.5 py-1 shadow-sm">{scheduledSorted.length} programate</span>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-2.5 sm:mt-7 sm:flex sm:flex-row sm:flex-wrap">
              <Link
                href={`/therapist/${therapistId}/sessions`}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-[18px] bg-[#5b4ce6] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4d3fde] sm:w-auto sm:rounded-2xl"
              >
                Vezi programul
              </Link>
              <Link
                href={`/therapist/${therapistId}/clients`}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-[18px] border border-[#ddd8ea] bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 sm:w-auto sm:rounded-2xl"
              >
                Deschide clienții
              </Link>
              <Link
                href={`/therapist/${therapistId}/notes`}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-[18px] border border-[#ddd8ea] bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 sm:w-auto sm:rounded-2xl"
              >
                Note
              </Link>
            </div>
          </div>
        </div>
        <div className="grid items-start gap-4 sm:gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <PanelCard title="Astăzi" subtitle="Sesiunile zilei și următorii pași" tone="light">
            {loading ? (
              <div className="mt-4 space-y-3">
                <div className="h-24 rounded-[22px] bg-[#f1eff8]" />
                <div className="h-24 rounded-[22px] bg-[#f1eff8]" />
                <div className="h-24 rounded-[22px] bg-[#f1eff8]" />
              </div>
            ) : todayAgenda.length === 0 ? (
              <EmptySoftState
                title="Nu ai sesiuni azi"
                description="Poți folosi timpul pentru a revizui notițele, clienții sau programările viitoare."
                href={`/therapist/${therapistId}/sessions`}
                cta="Deschide programul"
              />
            ) : (
              <div className="mt-4 space-y-2.5">
                {todayAgenda.slice(0, 2).map((session) => {
                  const client = clients.find((c) => c.id === session.clientUserId);
                  return (
                    <div
                      key={session.id}
                      className="flex flex-col gap-2.5 rounded-[20px] border border-[#e3e0ef] bg-white px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0 flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-[#f7f6fc] text-sm font-semibold text-slate-900 ring-1 ring-[#ece9ff]">
                          {initials(client?.name ?? "C")}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {client?.name ?? "Unknown client"}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {getSessionTypeLabel(session.type)} • {toNiceDate(session.startsAt)}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-end">
                        <Link
                          href={`/therapist/${therapistId}/clients/${session.clientUserId}`}
                          className="inline-flex min-h-9 items-center justify-center rounded-[14px] border border-[#ddd8ea] bg-white px-3 py-2 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-50 sm:rounded-xl"
                        >
                          Open client
                        </Link>
                        <Link
                          href={`/therapist/${therapistId}/notes`}
                          className="inline-flex min-h-9 items-center justify-center rounded-[14px] bg-[#5b4ce6] px-3 py-2 text-[11px] font-semibold text-white transition hover:bg-[#4d3fde] sm:rounded-xl"
                        >
                          Write note
                        </Link>
                      </div>
                    </div>
                  );
                })}
                <Link
                  href={`/therapist/${therapistId}/sessions`}
                  className="inline-flex mt-1 items-center gap-1 text-[11px] font-semibold text-[#5b4ce6] hover:underline sm:text-xs"
                >
                  <span>View full schedule</span>
                  <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <path fillRule="evenodd" d="M7.22 4.97a.75.75 0 0 1 1.06 0l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 1 1-1.06-1.06L11.19 10 7.22 6.03a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            )}
          </PanelCard>
          <PanelCard title="Acțiuni rapide" subtitle="Intrări rapide către paginile importante" tone="light">
            <div className="mt-4 grid gap-2.5 sm:grid-cols-2 sm:gap-3">
              {quickActions.map((action) => (
                <Link
                  key={action.title}
                  href={action.href}
                  className="flex items-center justify-between rounded-[18px] border border-[#e2def3] bg-white px-3.5 py-3.5 transition hover:bg-[#faf9fe] sm:rounded-[22px] sm:px-4 sm:py-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{action.title}</p>
                    <p className="mt-1 text-[11px] leading-5 text-slate-500 sm:text-xs">{action.subtitle}</p>
                  </div>
                  <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 shrink-0 text-[#5b4ce6]">
                    <path fillRule="evenodd" d="M7.22 4.97a.75.75 0 0 1 1.06 0l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 1 1-1.06-1.06L11.19 10 7.22 6.03a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                  </svg>
                </Link>
              ))}
            </div>
          </PanelCard>
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
      className={`rounded-[22px] border p-4 shadow-[0_10px_24px_rgba(31,29,26,0.05)] sm:rounded-[28px] sm:p-7 ${
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
            View all
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
    <div className="mt-5 rounded-3xl border border-dashed border-[#ddd8ea] bg-[#f8f7fc] p-8 text-center">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
      {href && cta ? (
        <Link
          href={href}
          className="mt-4 inline-flex items-center justify-center rounded-2xl bg-[#5b4ce6] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4d3fde]"
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
    <div className={`flex items-center justify-between gap-3 rounded-[20px] border px-4 py-3 ${toneClass}`}>
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${badgeClass}`}>
        {tone === "warn" ? "Important" : tone === "info" ? "Info" : "OK"}
      </span>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}


