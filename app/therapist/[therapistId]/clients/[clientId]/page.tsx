"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { apiFetch } from "@/app/_lib/authClient";

type RouteParams = { therapistId: string; clientId: string };

export default function TherapistClientProfilePage() {
  const params = useParams<RouteParams>();
  const therapistId = String(params?.therapistId ?? "");
  const clientId = String(params?.clientId ?? "");

  if (!therapistId || !clientId) {
    return (
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          Invalid URL. Missing therapistId or clientId.
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
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-gray-900">Client not found</h1>
          <p className="mt-2 text-sm text-gray-600">
            We couldn’t locate this client.
          </p>
          <div className="mt-5">
            <Link
              href={`/therapist/${therapistId}/clients`}
              className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              Back to clients
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (!loading && !isAllowed) {
    return (
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-gray-900">Access denied</h1>
          <p className="mt-2 text-sm text-gray-600">
            This client is not assigned to{" "}
            <span className="font-semibold text-gray-900" suppressHydrationWarning>
              {displayTherapistName}
            </span>
            .
          </p>
          <div className="mt-5">
            <Link
              href={`/therapist/${therapistId}/clients`}
              className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              Back to clients
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-8">
      {loading ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-4 text-sm text-gray-700 shadow-sm">
          Loading client…
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 shadow-sm">
          {error}
        </div>
      ) : null}
      {/* TOP BAR */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/therapist/${therapistId}/clients`}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition"
            aria-label="Back to clients"
            title="Back to clients"
          >
            <span aria-hidden="true">←</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center justify-center font-semibold">
              <span suppressHydrationWarning>{initialsFromName(displayClientName)}</span>
            </div>

            <div>
              <h1 className="text-2xl font-semibold text-gray-900" suppressHydrationWarning>
                {displayClientName}
              </h1>
              <p className="text-sm text-gray-600">
                Assigned therapist:{" "}
                <span className="font-semibold text-gray-900" suppressHydrationWarning>
                  {displayTherapistName}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS (demo) */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
            onClick={() => setTab("notes")}
          >
            View notes
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition"
            onClick={() => setTab("sessions")}
          >
            View sessions
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Stat label="Total sessions" value={String(clientSessions.length)} />
        <Stat label="Clinical notes" value={String(clientNotes.length)} />
        <Stat label="Status" value={isAllowed ? "Active" : "—"} valueClassName={isAllowed ? "text-green-600" : "text-gray-400"} />
      </div>

      {/* CONTENT CARD */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        {/* Tabs */}
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <TabButton active={tab === "notes"} onClick={() => setTab("notes")}>
              Notes
            </TabButton>
            <TabButton active={tab === "sessions"} onClick={() => setTab("sessions")}>
              Sessions
            </TabButton>
          </div>

          <div className="text-xs text-gray-500">
            Loaded from backend
          </div>
        </div>

        {/* Body */}
        <div className="p-5">
          {tab === "notes" ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">Clinical notes</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Private notes linked to this client (therapist view).
                  </p>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                  onClick={() => setTab("notes")}
                >
                  + Add note
                </button>
              </div>

              {clientNotes.length === 0 ? (
                <EmptyState
                  title="No notes yet"
                  text="When you add notes for this client, they’ll appear here."
                />
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {clientNotes.map((note) => (
                    <div
                      key={note.id}
                      className="rounded-2xl border border-gray-100 p-4 hover:border-gray-200 transition"
                    >
                      <p className="text-sm font-semibold text-gray-900">{"Session note"}</p>
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
                              className="list-none inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer [&::-webkit-details-marker]:hidden"
                              aria-label="More actions"
                            >
                              More
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

                            <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg z-20">
                              <div className="py-1">
                                <Link
                                  href={`/therapist/${therapistId}/clients/${clientId}`}
                                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                                  onClick={(e) => {
                                    (e.currentTarget.closest('details') as HTMLDetailsElement | null)?.removeAttribute('open');
                                  }}
                                >
                                  Open profile
                                </Link>
                                <button
                                  type="button"
                                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                                  onClick={(e) => {
                                    (e.currentTarget.closest('details') as HTMLDetailsElement | null)?.removeAttribute('open');
                                    alert("Coming soon");
                                  }}
                                >
                                  Pause/Resume
                                </button>
                                <button
                                  type="button"
                                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
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
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">Sessions</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Recorded sessions for this client (therapist view).
                  </p>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                  onClick={() => setTab("sessions")}
                >
                  + Add session
                </button>
              </div>

              {clientSessions.length === 0 ? (
                <EmptyState
                  title="No sessions recorded"
                  text="When you record sessions, they’ll appear here."
                />
              ) : (
                <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100 overflow-hidden">
                  {clientSessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between gap-3 p-4 text-sm hover:bg-gray-50 transition"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {session?.scheduledAt ? new Date(session.scheduledAt).toLocaleString() : String(session.date ?? session.id)}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          Session ID: {session.id} • {session.status ?? "—"}
                        </p>
                      </div>
                      <div className="mt-4 flex items-center justify-end">
                        <details className="relative">
                          <summary
                            className="list-none inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer [&::-webkit-details-marker]:hidden"
                            aria-label="More actions"
                          >
                            More
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

                          <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg z-20">
                            <div className="py-1">
                              <Link
                                href={`/therapist/${therapistId}/clients/${clientId}`}
                                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                                onClick={(e) => {
                                  (e.currentTarget.closest('details') as HTMLDetailsElement | null)?.removeAttribute('open');
                                }}
                              >
                                Open profile
                              </Link>
                              <button
                                type="button"
                                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                                onClick={(e) => {
                                  (e.currentTarget.closest('details') as HTMLDetailsElement | null)?.removeAttribute('open');
                                  alert("Coming soon");
                                }}
                              >
                                Pause/Resume
                              </button>
                              <button
                                type="button"
                                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
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
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
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
        "rounded-xl px-3 py-2 text-sm font-semibold transition",
        active
          ? "bg-indigo-600 text-white"
          : "bg-gray-50 text-gray-700 hover:bg-gray-100",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6">
      <p className="text-sm font-semibold text-gray-900">{title}</p>
      <p className="mt-1 text-sm text-gray-600">{text}</p>
    </div>
  );
}