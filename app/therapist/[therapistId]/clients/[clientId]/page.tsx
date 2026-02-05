"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { clients, therapists, notes, sessions } from "@/app/_mock/data";
import { useClientProfile, useTherapistProfile } from "@/app/_lib/profile";

type RouteParams = { therapistId: string; clientId: string };

export default function TherapistClientProfilePage() {
  const params = useParams<RouteParams>();
  const therapistId = (params?.therapistId as string) ?? "t1";
  const clientId = (params?.clientId as string) ?? "c1";

  const therapist = React.useMemo(
    () => therapists.find((t) => t.id === therapistId),
    [therapistId]
  );

  const client = React.useMemo(() => clients.find((c) => c.id === clientId), [clientId]);

  const therapistProfile = useTherapistProfile(
    therapistId,
    therapist?.name ?? therapistId,
    (therapist as any)?.email ?? "therapist@innery.com"
  );

  const clientProfile = useClientProfile(
    clientId,
    client?.name ?? clientId,
    (client as any)?.email ?? "client@innery.com"
  );

  const isAllowed = client?.therapistId === therapistId;

  const clientNotes = React.useMemo(
    () => notes.filter((n) => n.clientId === clientId && n.therapistId === therapistId),
    [clientId, therapistId]
  );

  const clientSessions = React.useMemo(
    () => sessions.filter((s) => s.clientId === clientId && s.therapistId === therapistId),
    [clientId, therapistId]
  );

  const [tab, setTab] = React.useState<"notes" | "sessions">("notes");

  const initialsFromName = (name: string) => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    const a = parts[0]?.[0] ?? "C";
    const b = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (a + b).toUpperCase();
  };

  const displayTherapistName = therapistProfile.name;
  const displayClientName = clientProfile.name;

  if (!client) {
    return (
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-gray-900">Client not found</h1>
          <p className="mt-2 text-sm text-gray-600">
            We couldn’t locate this client in the demo data.
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

  if (!isAllowed) {
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
        <Stat label="Status" value="Active" valueClassName="text-green-600" />
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
            Demo data · No backend yet
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
                  onClick={() => alert("Demo: Add note")}
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
                      <p className="text-sm font-semibold text-gray-900">{note.title}</p>
                      {"content" in note && (note as any).content ? (
                        <p className="mt-2 text-sm text-gray-600 leading-relaxed line-clamp-2">
                          {(note as any).content}
                        </p>
                      ) : null}
                      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                        <span>Note ID: {note.id}</span>
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
                                    alert(`Demo: Pause/Resume note ${note.id}`);
                                  }}
                                >
                                  Pause/Resume
                                </button>
                                <button
                                  type="button"
                                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                                  onClick={(e) => {
                                    (e.currentTarget.closest('details') as HTMLDetailsElement | null)?.removeAttribute('open');
                                    alert(`Demo: Remove note ${note.id}`);
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
                  onClick={() => alert("Demo: Add session")}
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
                        <p className="font-semibold text-gray-900 truncate">{session.date}</p>
                        <p className="mt-1 text-xs text-gray-500">Session ID: {session.id}</p>
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
                                  alert(`Demo: Pause/Resume session ${session.id}`);
                                }}
                              >
                                Pause/Resume
                              </button>
                              <button
                                type="button"
                                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                                onClick={(e) => {
                                  (e.currentTarget.closest('details') as HTMLDetailsElement | null)?.removeAttribute('open');
                                  alert(`Demo: Remove session ${session.id}`);
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