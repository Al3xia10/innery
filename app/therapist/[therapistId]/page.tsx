"use client";

import * as React from "react";

import Link from "next/link";
import { useParams } from "next/navigation";
import { therapists, clients, sessions as allSessions } from "@/app/_mock/data";
import { getClientProfile, useTherapistProfile } from "@/app/_lib/profile";

type Session = {
  id: string;
  therapistId: string;
  clientId: string;
  date: string;
  status?: "Upcoming" | "Completed" | "Canceled";
  type?: "Individual" | "Couple" | "Group";
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

function compareByDate(a: Session, b: Session) {
  const da = new Date(a.date).getTime();
  const db = new Date(b.date).getTime();
  if (Number.isNaN(da) || Number.isNaN(db)) return a.date.localeCompare(b.date);
  return da - db;
}

export default function TherapistDashboard() {
  const params = useParams() as { therapistId?: string };
  const therapistId = (params?.therapistId as string) ?? "t1";

  const [profileTick, setProfileTick] = React.useState(0);

  React.useEffect(() => {
    const bump = () => setProfileTick((x) => x + 1);

    const onStorage = () => bump();
    const onClient = () => bump();
    const onTherapist = () => bump();

    window.addEventListener("storage", onStorage);
    window.addEventListener("innery:client-profile-update", onClient as EventListener);
    window.addEventListener("innery:therapist-profile-update", onTherapist as EventListener);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("innery:client-profile-update", onClient as EventListener);
      window.removeEventListener("innery:therapist-profile-update", onTherapist as EventListener);
    };
  }, []);

  // ensure derived names re-compute when overrides change
  void profileTick;

  const therapist = React.useMemo(
    () => therapists.find((t) => t.id === therapistId),
    [therapistId]
  );

  const myClients = React.useMemo(
    () => clients.filter((c) => c.therapistId === therapistId),
    [therapistId]
  );

  const sessions = React.useMemo(
    () =>
      ((allSessions as unknown) as Session[])
        .filter((s) => s.therapistId === therapistId)
        .filter((s) => (s.status ?? "Upcoming") === "Upcoming")
        .slice()
        .sort(compareByDate),
    [therapistId]
  );

  const therapistProfile = useTherapistProfile(
    therapistId,
    therapist?.name ?? therapistId,
    (therapist as any)?.email ?? "therapist@innery.com"
  );

  const displayTherapistName = therapistProfile?.name ?? therapist?.name ?? therapistId;

  const upcoming = sessions.slice(0, 3);

  return (
    <section className="space-y-10">
      {/* PAGE TITLE */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            Therapist workspace
          </div>
          <h1 className="mt-2 text-2xl font-semibold text-gray-900">Your dashboard</h1>
          <p className="mt-1 text-sm text-gray-600 max-w-xl">
            A calm overview of your work, sessions, and client progress.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/therapist/${therapistId}/clients`}
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition"
          >
            View clients
          </Link>
          <Link
            href={`/therapist/${therapistId}/notes`}
            className="inline-flex items-center justify-center rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 transition"
          >
            New note
          </Link>
        </div>
      </header>

      {/* OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active clients"
          value={myClients.length.toString()}
          subtitle="ongoing relationships"
          href={`/therapist/${therapistId}/clients`}
        />
        <StatCard
          title="Upcoming"
          value={sessions.length.toString()}
          subtitle="scheduled sessions"
          href={`/therapist/${therapistId}/sessions`}
        />
        <StatCard
          title="Notes"
          value="—"
          subtitle="open your notes hub"
          href={`/therapist/${therapistId}/notes`}
        />
        <StatCard
          title="Settings"
          value=""
          subtitle="workspace preferences"
          href={`/therapist/${therapistId}/settings`}
        />
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-8">
          {/* UPCOMING SESSIONS */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold text-gray-900">Upcoming sessions</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Your next sessions. Jump to a client profile or open the sessions page.
                </p>
              </div>

              <Link
                href={`/therapist/${therapistId}/sessions`}
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition"
              >
                View all
              </Link>
            </div>

            {upcoming.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-dashed border-gray-200 p-8 text-center">
                <p className="text-sm font-semibold text-gray-900">No upcoming sessions</p>
                <p className="mt-1 text-sm text-gray-600">Create one from the Sessions page.</p>
                <Link
                  href={`/therapist/${therapistId}/sessions`}
                  className="mt-4 inline-flex items-center justify-center rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 transition"
                >
                  Go to sessions
                </Link>
              </div>
            ) : (
              <ul className="mt-5 divide-y">
                {upcoming.map((s) => {
                  const client = myClients.find((c) => c.id === s.clientId) ??
                    clients.find((c) => c.id === s.clientId);
                  const fallbackName = client?.name ?? "Unknown client";
                  const fallbackEmail = (client as any)?.email ?? "client@innery.com";
                  const name = getClientProfile(s.clientId, fallbackName, fallbackEmail).name;
                  const type = s.type ?? "Individual";

                  return (
                    <SessionRow
                      key={s.id}
                      therapistId={therapistId}
                      clientId={s.clientId}
                      name={name}
                      time={toNiceDate(s.date)}
                      type={type}
                    />
                  );
                })}
              </ul>
            )}
          </div>

          {/* CLIENTS OVERVIEW */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold text-gray-900">Clients overview</h2>
                <p className="mt-1 text-sm text-gray-600">Quick access to your active clients.</p>
              </div>
              <Link
                href={`/therapist/${therapistId}/clients`}
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition"
              >
                View all
              </Link>
            </div>

            {myClients.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-dashed border-gray-200 p-8 text-center">
                <p className="text-sm font-semibold text-gray-900">No clients yet</p>
                <p className="mt-1 text-sm text-gray-600">Add your first client from the Clients page.</p>
                <Link
                  href={`/therapist/${therapistId}/clients`}
                  className="mt-4 inline-flex items-center justify-center rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 transition"
                >
                  Go to clients
                </Link>
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {myClients.slice(0, 6).map((client) => (
                  <Link
                    key={client.id}
                    href={`/therapist/${therapistId}/clients/${client.id}`}
                    className="group rounded-2xl border border-gray-100 bg-gray-50/40 p-4 hover:bg-white hover:border-gray-200 hover:shadow-sm transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-50 text-indigo-700 font-semibold">
                        {getClientProfile(
                          client.id,
                          client.name,
                          (client as any)?.email ?? "client@innery.com"
                        ).name
                          .split(" ")
                          .filter(Boolean)
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {getClientProfile(
                            client.id,
                            client.name,
                            (client as any)?.email ?? "client@innery.com"
                          ).name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">Client ID: {client.id}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          {/* PROFILE */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-900">Profile</h2>
            <p className="mt-1 text-sm text-gray-600">Signed in as</p>
            <div className="mt-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-semibold">
                {(displayTherapistName ?? "T")
                  .split(" ")
                  .filter(Boolean)
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{displayTherapistName}</p>
                <p className="text-xs text-gray-500 truncate">Therapist ID: {therapistId}</p>
              </div>
            </div>
          </div>

          {/* RECENT NOTES */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold text-gray-900">Notes hub</h2>
                <p className="mt-1 text-sm text-gray-600">Open your notes to write, edit and organize.</p>
              </div>
              <Link
                href={`/therapist/${therapistId}/notes`}
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition"
              >
                Open
              </Link>
            </div>

            <div className="mt-5 rounded-2xl bg-gray-50/40 border border-gray-100 p-4">
              <p className="text-sm text-gray-700 leading-relaxed">
                Tip: After each session, write 3 quick lines — (1) what happened, (2) what it means, (3) next step.
              </p>
            </div>
          </div>



         
        </div>
      </div>
    </section>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  href,
}: {
  title: string;
  value: string;
  subtitle: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-gray-200 hover:shadow-md transition"
    >
      <p className="text-sm text-gray-600">{title}</p>
      {value ? <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p> : null}
      <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
      <p className="mt-4 text-sm font-semibold text-indigo-600 group-hover:text-indigo-700 transition">
        Open →
      </p>
    </Link>
  );
}

function SessionRow({
  therapistId,
  clientId,
  name,
  time,
  type,
}: {
  therapistId: string;
  clientId: string;
  name: string;
  time: string;
  type: string;
}) {
  return (
    <li className="flex items-center justify-between gap-3 py-4 text-sm">
      <div className="min-w-0">
        <Link
          href={`/therapist/${therapistId}/clients/${clientId}`}
          className="font-semibold text-gray-900 hover:text-indigo-700 transition truncate"
        >
          {name}
        </Link>
        <p className="text-gray-500 truncate">{type}</p>
      </div>
      <span className="text-gray-500 shrink-0">{time}</span>
    </li>
  );
}
