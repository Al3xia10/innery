"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/app/_lib/authClient";

type RouteParams = { therapistId: string; clientId: string };

export default function TherapistClientProfilePage() {
  const params = useParams<RouteParams>();
  const therapistId = String(params?.therapistId ?? "");
  const clientId = String(params?.clientId ?? "");
  const router = useRouter();

  if (!therapistId || !clientId) {
    return (
     <section className="mx-auto max-w-6xl px-3 py-4 sm:px-6 lg:px-8">
  <div className="rounded-[28px] border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-sm sm:rounded-4xl">
    URL invalid. Lipsește therapistId sau clientId.
  </div>
</section>
    );
  }

  const [tab, setTab] = React.useState<"notes" | "sessions">("notes");

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [displayTherapistName, setDisplayTherapistName] = React.useState<string>(therapistId);
  const [displayClientName, setDisplayClientName] = React.useState<string>(clientId);

  const [clientNotes, setClientNotes] = React.useState<any[]>([]);
  const [clientSessions, setClientSessions] = React.useState<any[]>([]);
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

  const initialsFromName = (name: string) => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    const a = parts[0]?.[0] ?? "C";
    const b = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (a + b).toUpperCase();
  };

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
        const list = clientsData?.clients ?? [];

        const found = list.find((row: any) => {
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

        // Notes hub (optional; endpoint may not exist yet)
        let filteredNotes: any[] = [];
        try {
          const notesData = await apiFetch(`/api/therapists/${therapistId}/notes`, { method: "GET" });
          const allNotes = notesData?.notes ?? [];
          filteredNotes = allNotes.filter((n: any) => {
            const session = n.session ?? {};
            const clientUserId = String(session.clientUser?.id ?? session.clientUserId ?? "");
            return clientUserId === String(clientId);
          });
        } catch {
          filteredNotes = [];
        }

        // Sessions list (optional; endpoint may not exist yet)
        let filteredSessions: any[] = [];
        try {
          const sessionsData = await apiFetch(`/api/therapists/${therapistId}/sessions`, { method: "GET" });
          const allSessions = sessionsData?.sessions ?? [];
          filteredSessions = allSessions.filter((s: any) => String(s.clientUserId) === String(clientId));
        } catch {
          filteredSessions = [];
        }

        if (alive) {
          setClientNotes(filteredNotes);
          setClientSessions(filteredSessions);
        }
      } catch (e: any) {
        if (alive) setError(e?.message || "Failed to load client profile");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [therapistId, clientId]);

  if (!loading && (error || !displayClientName)) {
    return (
      <section className="mx-auto max-w-6xl px-3 py-4 sm:px-6 lg:px-8">
  <div className="rounded-[28px] border border-black/5 bg-white/90 p-6 shadow-[0_10px_24px_rgba(31,23,32,0.05)] sm:rounded-4xl">
    <h1 className="text-xl font-semibold text-gray-900">Client inexistent</h1>
    <p className="mt-2 text-sm text-gray-600">
      Nu am putut găsi acest client.
    </p>
    <div className="mt-5">
      <Link
        href={`/therapist/${therapistId}/clients`}
        className="inline-flex items-center justify-center rounded-[18px] border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
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

  <div className="rounded-[28px] border border-black/5 bg-white/90 p-6 shadow-[0_10px_24px_rgba(31,23,32,0.05)] sm:rounded-4xl">
    <h1 className="text-xl font-semibold text-gray-900">Acces interzis</h1>
    <p className="mt-2 text-sm text-gray-600">
      Acest client nu este alocat lui{" "}
      <span className="font-semibold text-gray-900" suppressHydrationWarning>
        {displayTherapistName}
      </span>
      .
    </p>
    <div className="mt-5">
      <Link
        href={`/therapist/${therapistId}/clients`}
        className="inline-flex items-center justify-center rounded-[18px] border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
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
        <div className="rounded-[20px] border border-black/5 bg-white/90 p-4 text-sm text-gray-700 shadow-[0_6px_16px_rgba(31,23,32,0.04)]">
        Se incarca clientul...
      </div>  
      ) : error ? (
        <div className="rounded-[20px] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 shadow-[0_6px_16px_rgba(31,23,32,0.04)]">
          {error}
        </div>
      ) : null}
      {/* TOP BAR */}
      {/* TOP BAR */}
<section
  className="overflow-hidden rounded-[28px] border border-black/5 shadow-sm sm:rounded-4xl"
  style={{
    background:
      "linear-gradient(135deg, #ffffff 0%, rgba(239,208,202,0.18) 60%, rgba(125,128,218,0.08) 100%)",
  }}
>
  <div className="flex flex-col gap-4 p-4 sm:p-7 lg:flex-row lg:items-start lg:justify-between">
    <div className="max-w-3xl">

      <div className="mt-4 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-[20px] bg-(--color-card) text-sm font-semibold text-(--color-primary) ring-1 ring-black/5">
          <span suppressHydrationWarning>{initialsFromName(displayClientName)}</span>
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="w-full text-[2rem] font-semibold leading-[1.02] tracking-tight text-slate-900 sm:text-[2.3rem]" suppressHydrationWarning>
              {displayClientName}
            </h1>
          </div>
          <p className="text-sm text-[#6B5A63]">
            Terapeut alocat:{" "}
            <span className="font-semibold text-slate-900" suppressHydrationWarning>
              {displayTherapistName}
            </span>
          </p>
        </div>
      </div>

      <p className="mt-4 max-w-2xl text-sm leading-7 text-[#6B5A63] sm:text-[15px]">
        Revizuiește notițele, ședințele și statusul actual al acestui client într-un singur spațiu organizat.
      </p>
    </div>

  <div className="mt-5 grid w-full grid-cols-2 gap-2.5 self-start sm:flex sm:w-auto sm:items-center sm:gap-3">
  <Link
  href={`/therapist/${therapistId}/clients`}
  className="inline-flex min-h-11 w-full items-center justify-center rounded-[18px] border border-black/5 bg-white/85 px-4 py-3 text-center text-sm font-semibold leading-5 text-slate-700 shadow-sm transition hover:bg-white sm:min-w-36 sm:w-auto sm:rounded-[20px] sm:px-5"
  aria-label="Înapoi la clienți"
  title="Înapoi la clienți"
>
  Înapoi la clienți
</Link>

  <button
  type="button"
  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[18px] bg-(--color-accent) px-4 py-3 text-center text-sm font-semibold leading-5 text-white shadow-sm transition hover:opacity-90 sm:min-w-36 sm:w-auto sm:whitespace-nowrap sm:rounded-[20px] sm:px-5"
  onClick={() => setTab("sessions")}
>
  Vezi ședințele
</button>
</div>
</div>
  </section>

      {/* STATS */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Stat label="Ședințe totale" value={String(clientSessions.length)} />
      <Stat label="Notițe clinice" value={String(clientNotes.length)} />
      <Stat label="Ultima ședință" value={latestSessionLabel} valueClassName="text-slate-900 text-lg" />
      <Stat label="Ultima notiță" value={latestNoteLabel} valueClassName="text-slate-900 text-lg" />
      </div>

      {/* CONTENT CARD */}
      <div className="overflow-hidden rounded-[28px] border border-black/5 bg-white/90 shadow-[0_12px_28px_rgba(31,23,32,0.05)] sm:rounded-4xl">
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
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
  <div>
    <h2 className="text-sm font-semibold text-gray-900">Notițe clinice</h2>
    <p className="mt-1 text-sm text-gray-600">
      Notițe private asociate acestui client.
    </p>
    <p className="mt-2 text-xs text-[#6B5A63]">
      {clientNotes.length} notiț{clientNotes.length === 1 ? "ă" : "e"} disponibil{clientNotes.length === 1 ? "ă" : "e"}
    </p>
  </div>
  <button
    type="button"
    className="inline-flex items-center justify-center rounded-xl border border-black/5 bg-(--color-card) px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-(--color-soft)"
    onClick={() => router.push(`/therapist/${therapistId}/notes`)}
  >
    + Adaugă notiță
  </button>
</div>

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
                      className="rounded-[20px] border border-black/5 bg-white/85 p-4 shadow-[0_4px_12px_rgba(31,23,32,0.04)] transition hover:bg-white"
                    >
                      <p className="text-sm font-semibold text-gray-900">{"Notiță de ședință"}</p>
                      {note?.content ? (
                        <p className="mt-2 text-sm text-gray-600 leading-relaxed line-clamp-2">
                          {note.content}
                        </p>
                      ) : null}
                      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                        <span>{note?.createdAt ? new Date(note.createdAt).toLocaleString() : `Note #${note.id}`}</span>
                        <div className="mt-4 flex items-center justify-end">
                          <details className="relative">
                            <summary
                              className="list-none inline-flex items-center gap-2 rounded-xl border border-black/5 bg-(--color-card) px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-(--color-soft) cursor-pointer [&::-webkit-details-marker]:hidden"
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
                                  Open profile
                                </Link>
                                <button
                                  type="button"
                                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 transition hover:bg-(--color-card)"
                                  onClick={(e) => {
                                    (e.currentTarget.closest('details') as HTMLDetailsElement | null)?.removeAttribute('open');
                                    alert("Coming soon");
                                  }}
                                >
                                  Pause/Resume
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
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Ședințe</h2>
              <p className="mt-1 text-sm text-gray-600">
                Ședințele înregistrate pentru acest client.
              </p>
              <p className="mt-2 text-xs text-[#6B5A63]">
                {clientSessions.length} ședinț{clientSessions.length === 1 ? "ă" : "e"} disponibil{clientSessions.length === 1 ? "ă" : "e"}
              </p>
            </div>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-xl border border-black/5 bg-(--color-card) px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-(--color-soft)"
              onClick={() => router.push(`/therapist/${therapistId}/sessions`)}
            >
              + Adaugă ședință
            </button>
          </div>

              {clientSessions.length === 0 ? (
              <EmptyState
            title="Nu există ședințe înregistrate"
            text="Când înregistrezi ședințe, ele vor apărea aici."
            actionLabel="Adaugă ședință"
            onAction={() => router.push(`/therapist/${therapistId}/sessions`)}
            />
              ) : (
                <div className="overflow-hidden rounded-[20px] border border-black/5 bg-white/85 shadow-[0_4px_12px_rgba(31,23,32,0.04)]">
                  {clientSessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between gap-3 border-b border-black/5 p-4 text-sm transition last:border-b-0 hover:bg-white"
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
                            className="list-none inline-flex items-center gap-2 rounded-xl border border-black/5 bg-(--color-card) px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-(--color-soft) cursor-pointer [&::-webkit-details-marker]:hidden"
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

function Stat({
  label,
  value,
  valueClassName = "text-gray-900",
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-[20px] border border-black/5 bg-white/90 p-4 shadow-[0_6px_16px_rgba(31,23,32,0.04)] sm:p-5">
      <p className="text-sm text-[#6B5A63]">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${valueClassName}`}>{value}</p>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-[18px] px-3 py-2 text-sm font-semibold transition",
        active
          ? "bg-(--color-accent) text-white shadow-sm"
          : "bg-(--color-card) text-gray-700 hover:bg-(--color-soft)",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function EmptyState({
  title,
  text,
  actionLabel,
  onAction,
}: {
  title: string;
  text: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="rounded-[20px] border border-dashed border-black/10 bg-(--color-card) p-5 shadow-[0_4px_12px_rgba(31,23,32,0.03)] sm:p-6">
      <p className="text-sm font-semibold text-gray-900">{title}</p>
      <p className="mt-1 text-sm text-[#6B5A63]">{text}</p>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 inline-flex items-center justify-center rounded-xl bg-(--color-accent) px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}