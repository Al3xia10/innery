"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/app/_lib/authClient";
import EmptyState from "./components/EmptyState";
import ProfileTopBar from "./components/ProfileTopBar";
import SectionHeader from "./components/SectionHeader";
import Stat from "./components/Stat";
import TabButton from "./components/TabButton";

type RouteParams = { therapistId: string; clientId: string };
type ClientListRow = {
  kind?: "invite" | "linked";
  therapistId?: string | number;
  user?: { id?: string | number; name?: string };
  userId?: string | number;
  id?: string | number;
  name?: string;
};
type NoteRow = {
  id?: string | number;
  content?: string;
  createdAt?: string;
  session?: { clientUser?: { id?: string | number }; clientUserId?: string | number };
  [key: string]: unknown;
};
type SessionRow = {
  id?: string | number;
  startsAt?: string;
  clientUserId?: string | number;
  scheduledAt?: string;
  date?: string;
  status?: string;
  durationMin?: number;
  [key: string]: unknown;
};
type GoalProgressRow = {
  id?: string | number;
  title?: string;
  status?: string;
  progress?: number;
  stepsDone?: number;
  stepsTotal?: number;
};

export default function TherapistClientProfilePage() {
  const params = useParams<RouteParams>();
  const therapistId = String(params?.therapistId ?? "");
  const clientId = String(params?.clientId ?? "");
  const router = useRouter();

  const [tab, setTab] = React.useState<"notes" | "sessions">("notes");

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [displayTherapistName, setDisplayTherapistName] = React.useState<string>(therapistId);
  const [displayClientName, setDisplayClientName] = React.useState<string>(clientId);

  const [clientNotes, setClientNotes] = React.useState<NoteRow[]>([]);
  const [clientSessions, setClientSessions] = React.useState<SessionRow[]>([]);
  const [clientGoals, setClientGoals] = React.useState<GoalProgressRow[]>([]);
  const [isAllowed, setIsAllowed] = React.useState(true);
    const latestSession = clientSessions[0] ?? null;
  const latestSessionLabel = latestSession?.scheduledAt
    ? new Date(latestSession.scheduledAt).toLocaleDateString()
    : latestSession?.date
    ? String(latestSession.date)
    : "Nicio ședință încă";

  const latestNoteLabel = clientNotes[0]?.createdAt
    ? new Date(clientNotes[0].createdAt).toLocaleDateString()
    : "Nicio notiță încă";

  React.useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        // therapist name (from localStorage set at login; fallback to therapistId)
        try {
          const raw = localStorage.getItem("innery_user");
          const user = raw ? JSON.parse(raw) : null;
          if (alive) setDisplayTherapistName(user?.name ?? therapistId);
        } catch {
          if (alive) setDisplayTherapistName(therapistId);
        }

        // clients list (to get name + validate ownership)
        const clientsData = await apiFetch(`/api/therapists/${therapistId}/clients`, { method: "GET" });
        const list: ClientListRow[] = Array.isArray(clientsData?.clients) ? clientsData.clients : [];

        const found = list.find((row) => {
          const kind = row?.kind === "invite" ? "invite" : "linked";
          if (kind === "invite") return false; // invites don't have a profile route
          const id = String(row?.user?.id ?? row?.userId ?? row?.id ?? "");
          return id === String(clientId);
        });
        const clientName = String(found?.user?.name ?? found?.name ?? clientId);

        if (alive) {
          setDisplayClientName(clientName);
          // if backend provides therapistId for the client row, use it to validate
          const owner = String(found?.therapistId ?? therapistId);
          setIsAllowed(owner === String(therapistId));
        }

        // Notițe hub (optional; endpoint may not exist yet)
        let filteredNotes: NoteRow[] = [];
        try {
          const notesData = await apiFetch(`/api/therapists/${therapistId}/notes`, { method: "GET" });
          const allNotes: NoteRow[] = Array.isArray(notesData?.notes) ? notesData.notes : [];
          filteredNotes = allNotes.filter((n) => {
            const session = n.session ?? {};
            const clientUserId = String(session.clientUser?.id ?? session.clientUserId ?? "");
            return clientUserId === String(clientId);
          });
        } catch {
          filteredNotes = [];
        }

        // Ședințe list (optional; endpoint may not exist yet)
        let filteredSessions: SessionRow[] = [];
        try {
          const sessionsData = await apiFetch(`/api/therapists/${therapistId}/sessions`, { method: "GET" });
          const allSessions: SessionRow[] = Array.isArray(sessionsData?.sessions)
            ? sessionsData.sessions
            : [];
          filteredSessions = allSessions.filter((s) => String(s.clientUserId) === String(clientId));
        } catch {
          filteredSessions = [];
        }

        // Goals progress (optional)
        let goalsProgress: GoalProgressRow[] = [];
        try {
          const goalsData = await apiFetch(
            `/api/therapists/${therapistId}/clients/${clientId}/goals-progress`,
            { method: "GET" }
          );
          goalsProgress = Array.isArray(goalsData?.goals) ? goalsData.goals : [];
        } catch {
          goalsProgress = [];
        }

        if (alive) {
          setClientNotes(filteredNotes);
          setClientSessions(filteredSessions);
          setClientGoals(goalsProgress);
        }
      } catch (e: unknown) {
        const message =
          e instanceof Error && e.message ? e.message : "Failed to load client profile";
        if (alive) setError(message);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [therapistId, clientId]);

  if (!therapistId || !clientId) {
    return (
      <section className="mx-auto max-w-6xl px-3 py-4 sm:px-6 lg:px-8">
        <div className="rounded-[20px] border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm sm:rounded-[28px] sm:p-6">
          URL invalid. Lipsește therapistId sau clientId.
        </div>
      </section>
    );
  }

  if (!loading && (error || !displayClientName)) {
    return (
      <section className="mx-auto max-w-6xl px-3 py-4 sm:px-6 lg:px-8">
        <div className="rounded-[20px] border border-black/5 bg-white/90 p-4 shadow-[0_10px_24px_rgba(31,23,32,0.05)] sm:rounded-[28px] sm:p-6">
          <h1 className="text-xl font-semibold text-gray-900">Client inexistent</h1>
          <p className="mt-2 text-sm leading-6 sm:leading-7 text-gray-600">
            Nu am putut găsi acest client.
          </p>
          <div className="mt-5">
            <Link
              href={`/therapist/${therapistId}/clients`}
              className="inline-flex min-h-11 w-full sm:w-auto items-center justify-center rounded-[18px] border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Înapoi la clienți
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (!loading && !isAllowed) {
    return (
      <section className="mx-auto max-w-6xl px-3 py-4 sm:px-6 lg:px-8">
        <div className="rounded-[20px] border border-black/5 bg-white/90 p-4 shadow-[0_10px_24px_rgba(31,23,32,0.05)] sm:rounded-[28px] sm:p-6">
          <h1 className="text-xl font-semibold text-gray-900">Acces interzis</h1>
          <p className="mt-2 text-sm leading-6 sm:leading-7 text-gray-600">
            Acest client nu este alocat lui{" "}
            <span className="font-semibold text-gray-900" suppressHydrationWarning>
              {displayTherapistName}
            </span>
            .
          </p>
          <div className="mt-5">
            <Link
              href={`/therapist/${therapistId}/clients`}
              className="inline-flex min-h-11 w-full sm:w-auto items-center justify-center rounded-[18px] border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Înapoi la clienți
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl space-y-5 px-3 py-4 sm:px-6 lg:px-8">
      {loading ? (
        <div className="rounded-[20px] border border-black/5 bg-white/90 p-4 text-sm text-gray-700 shadow-[0_6px_16px_rgba(31,23,32,0.04)] sm:rounded-[28px]">
          Se încarcă clientul...
        </div>
      ) : error ? (
        <div className="rounded-[20px] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 shadow-[0_6px_16px_rgba(31,23,32,0.04)] sm:rounded-[28px]">
          {error}
        </div>
      ) : null}
      <ProfileTopBar
        displayClientName={displayClientName}
        displayTherapistName={displayTherapistName}
        therapistId={therapistId}
        onViewSessions={() => setTab("sessions")}
      />

      {/* STATS */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Ședințe totale" value={String(clientSessions.length)} />
        <Stat label="Notițe clinice" value={String(clientNotes.length)} />
        <Stat
          label="Progress obiective"
          value={`${clientGoals.length ? Math.round(clientGoals.reduce((acc, g) => acc + Number(g.progress ?? 0), 0) / clientGoals.length) : 0}%`}
        />
        <Stat label="Ultima ședință" value={latestSessionLabel} valueClassName="text-slate-900 text-lg" />
        <Stat label="Ultima notiță" value={latestNoteLabel} valueClassName="text-slate-900 text-lg" />
      </div>

      {clientGoals.length ? (
        <div className="overflow-hidden rounded-[20px] border border-black/5 bg-white/90 p-4 shadow-[0_12px_28px_rgba(31,23,32,0.05)] sm:rounded-[28px] sm:p-5">
          <h2 className="text-sm font-semibold text-gray-900">Obiective client</h2>
          <p className="mt-1 text-sm leading-6 sm:leading-7 text-[#6B5A63]">Progressul calculat din pașii bifați de client.</p>
          <div className="mt-4 space-y-3">
            {clientGoals.map((goal) => {
              const progress = Math.max(0, Math.min(100, Number(goal.progress ?? 0)));
              const statusLabel =
                goal.status === "done"
                  ? "Încheiat"
                  : goal.status === "paused"
                  ? "În pauză"
                  : "Activ";
              return (
                <div
                  key={String(goal.id)}
                  className="rounded-[18px] border border-black/5 bg-white/85 p-3.5 shadow-[0_4px_10px_rgba(31,23,32,0.04)] sm:rounded-[20px]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-semibold text-gray-900">{String(goal.title ?? "Obiectiv")}</p>
                    <span className="text-xs font-semibold text-[#6B5A63]">{statusLabel}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/5">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${progress}%`,
                          background:
                            "linear-gradient(90deg, rgba(239,208,202,0.9), rgba(125,128,218,0.45))",
                        }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-[#6B5A63]">{progress}%</span>
                  </div>
                  <p className="mt-2 text-xs text-[#6B5A63]">
                    {Number(goal.stepsDone ?? 0)} / {Number(goal.stepsTotal ?? 0)} pași finalizați
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* CONTENT CARD */}
      <div className="overflow-hidden rounded-[20px] border border-black/5 bg-white/90 shadow-[0_12px_28px_rgba(31,23,32,0.05)] sm:rounded-[28px]">
        {/* Tabs */}
        <div className="flex flex-col gap-3 border-b border-black/5 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex items-center gap-2">
            <TabButton active={tab === "notes"} onClick={() => setTab("notes")}>
              Notițe
            </TabButton>
            <TabButton active={tab === "sessions"} onClick={() => setTab("sessions")}>
              Ședințe
            </TabButton>
          </div>
        </div>
        {/* Body */}
        <div className="p-4 sm:p-5">
          {tab === "notes" ? (
            <div className="space-y-4">
              <SectionHeader
                title="Notițe clinice"
                description="Notițe private asociate acestui client."
                countText={`${clientNotes.length} notiț${clientNotes.length === 1 ? "ă" : "e"} disponibil${clientNotes.length === 1 ? "ă" : "e"}`}
                actionLabel="+ Adaugă notiță"
                onAction={() => router.push(`/therapist/${therapistId}/notes`)}
              />

              {clientNotes.length === 0 ? (
              <EmptyState
            title="Nu există încă notițe"
            text="Când adaugi notițe pentru acest client, ele vor apărea aici."
            actionLabel="Creează prima notiță"
            onAction={() => router.push(`/therapist/${therapistId}/notes`)}
          />
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {clientNotes.map((note) => (
                    <div
                      key={note.id}
                      className="rounded-[20px] border border-black/5 bg-white/85 p-4 shadow-[0_4px_12px_rgba(31,23,32,0.04)] transition hover:bg-white sm:rounded-3xl"
                    >
                      <p className="text-sm font-semibold text-gray-900">{"Notiță de ședință"}</p>
                      {note?.content ? (
                        <p className="mt-2 text-sm leading-6 sm:leading-relaxed text-gray-600 line-clamp-2">
                          {note.content}
                        </p>
                      ) : null}
                      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs text-gray-500">
                        <span>{note?.createdAt ? new Date(note.createdAt).toLocaleString() : `Note #${note.id}`}</span>
                        <div className="mt-4 flex items-center justify-end">
                          <details className="relative">
                            <summary
                              className="list-none inline-flex min-h-10 w-full sm:w-auto items-center justify-center gap-2 rounded-[18px] border border-black/5 bg-(--color-card) px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-(--color-soft) cursor-pointer [&::-webkit-details-marker]:hidden"
                              aria-label="More actions"
                            >
                              Mai mult
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="h-4 w-4"
                                aria-hidden="true"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                              </svg>
                            </summary>
                            <div className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-[20px] border border-black/5 bg-white shadow-[0_12px_28px_rgba(31,23,32,0.12)]">
                              <div className="py-1">
                                <Link
                                  href={`/therapist/${therapistId}/clients/${clientId}`}
                                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 transition hover:bg-(--color-card)"
                                  onClick={(e) => {
                                    (e.currentTarget.closest('details') as HTMLDetailsElement | null)?.removeAttribute('open');
                                  }}
                                >
                                  Deschide profilul
                                </Link>
                                <button
                                  type="button"
                                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 transition hover:bg-(--color-card)"
                                  onClick={(e) => {
                                    (e.currentTarget.closest('details') as HTMLDetailsElement | null)?.removeAttribute('open');
                                    alert("Coming soon");
                                  }}
                                >
                                  Pauză/Continuă
                                </button>
                                <button
                                  type="button"
                                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 transition hover:bg-red-50"
                                  onClick={(e) => {
                                    (e.currentTarget.closest('details') as HTMLDetailsElement | null)?.removeAttribute('open');
                                    alert("Coming soon");
                                  }}
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </details>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <SectionHeader
                title="Ședințe"
                description="Ședințele înregistrate pentru acest client."
                countText={`${clientSessions.length} ședinț${clientSessions.length === 1 ? "ă" : "e"} disponibil${clientSessions.length === 1 ? "ă" : "e"}`}
                actionLabel="+ Adaugă ședință"
                onAction={() => router.push(`/therapist/${therapistId}/sessions`)}
              />

              {clientSessions.length === 0 ? (
              <EmptyState
            title="Nu există ședințe înregistrate"
            text="Când înregistrezi ședințe, ele vor apărea aici."
            actionLabel="Adaugă ședință"
            onAction={() => router.push(`/therapist/${therapistId}/sessions`)}
            />
              ) : (
                <div className="overflow-hidden rounded-[20px] border border-black/5 bg-white/85 shadow-[0_4px_12px_rgba(31,23,32,0.04)] sm:rounded-3xl">
                  {clientSessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex flex-col gap-3 border-b border-black/5 p-4 text-sm transition last:border-b-0 hover:bg-white sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {session?.scheduledAt ? new Date(session.scheduledAt).toLocaleString() : String(session.date ?? session.id)}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          ID ședință: {session.id} • {session.status ?? "—"}
                        </p>
                      </div>
                      <div className="mt-4 flex items-center justify-end">
                        <details className="relative">
                          <summary
                            className="list-none inline-flex min-h-10 w-full sm:w-auto items-center justify-center gap-2 rounded-[18px] border border-black/5 bg-(--color-card) px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-(--color-soft) cursor-pointer [&::-webkit-details-marker]:hidden"
                            aria-label="More actions"
                          >
                            Mai mult
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className="h-4 w-4"
                              aria-hidden="true"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                            </svg>
                          </summary>
                          <div className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-[20px] border border-black/5 bg-white shadow-[0_12px_28px_rgba(31,23,32,0.12)]">
                            <div className="py-1">
                              <Link
                                href={`/therapist/${therapistId}/clients/${clientId}`}
                                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 transition hover:bg-(--color-card)"
                                onClick={(e) => {
                                  (e.currentTarget.closest('details') as HTMLDetailsElement | null)?.removeAttribute('open');
                                }}
                              >
                                Deschide profilul
                              </Link>
                              <button
                                type="button"
                                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 transition hover:bg-(--color-card)"
                                onClick={(e) => {
                                  (e.currentTarget.closest('details') as HTMLDetailsElement | null)?.removeAttribute('open');
                                  alert("Coming soon");
                                }}
                              >
                                Pauză/Continuă
                              </button>
                              <button
                                type="button"
                                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 transition hover:bg-red-50"
                                onClick={(e) => {
                                  (e.currentTarget.closest('details') as HTMLDetailsElement | null)?.removeAttribute('open');
                                  alert("Coming soon");
                                }}
                              >
                                Șterge
                              </button>
                            </div>
                          </div>
                        </details>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
