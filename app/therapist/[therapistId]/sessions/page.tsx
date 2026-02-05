
"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { clients, sessions as allSessions, therapists } from "@/app/_mock/data";
import { getClientProfile, useTherapistProfile } from "@/app/_lib/profile";

type SessionStatus = "Upcoming" | "Completed" | "Canceled";

type Session = {
  id: string;
  therapistId: string;
  clientId: string;
  date: string; // ISO-like string in mock
  status?: SessionStatus;
  type?: "Individual" | "Couple" | "Group";
  notesPreview?: string;
};

function uid(prefix = "s") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function toNiceDate(raw: string) {
  // Works for either ISO-ish strings or simple YYYY-MM-DD.
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


function statusPillClass(status: SessionStatus) {
  switch (status) {
    case "Upcoming":
      return "bg-indigo-50 text-indigo-700 ring-indigo-100";
    case "Completed":
      return "bg-emerald-50 text-emerald-700 ring-emerald-100";
    case "Canceled":
      return "bg-rose-50 text-rose-700 ring-rose-100";
  }
}

export default function TherapistSessionsPage() {
  const params = useParams<{ therapistId: string }>();
  const therapistId = params?.therapistId ?? "t1";

  const therapist = React.useMemo(
    () => therapists.find((t) => t.id === therapistId),
    [therapistId]
  );

  // Seed mock sessions for this therapist (in-memory only)
  const seed = React.useMemo<Session[]>(() => {
    const base = allSessions
      .filter((s) => s.therapistId === therapistId)
      .map((s) => ({
        ...s,
        status: (s as any).status ?? "Upcoming",
        type: (s as any).type ?? "Individual",
        notesPreview:
          (s as any).notesPreview ??
          "Session details are stored privately. Add a brief summary after the call.",
      })) as Session[];

    return base.slice().sort(compareByDate);
  }, [therapistId]);

  const [sessions, setSessions] = React.useState<Session[]>(seed);
  const [selectedId, setSelectedId] = React.useState<string>(seed[0]?.id ?? "");
  const [query, setQuery] = React.useState<string>("");
  const [filter, setFilter] = React.useState<"all" | "upcoming" | "completed" | "canceled">("all");

  const [profileTick, setProfileTick] = React.useState(0);

  // Re-render when local profile overrides change (same tab or other tabs)
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

  const getClientName = React.useCallback(
    (clientId: string) => {
      // profileTick is intentionally referenced to re-evaluate on updates
      void profileTick;

      const c = clients.find((x) => x.id === clientId);
      const fallbackName = c?.name ?? "Unknown client";
      const fallbackEmail = (c as any)?.email ?? "client@innery.com";
      return getClientProfile(clientId, fallbackName, fallbackEmail).name;
    },
    [profileTick]
  );

  // Reschedule modal
  const [rescheduleOpen, setRescheduleOpen] = React.useState(false);
  const [draftDate, setDraftDate] = React.useState<string>("");

  React.useEffect(() => {
    setSessions(seed);
    setSelectedId(seed[0]?.id ?? "");
    setQuery("");
    setFilter("all");
    setRescheduleOpen(false);
    setDraftDate("");
  }, [seed]);

  const selected = React.useMemo(
    () => sessions.find((s) => s.id === selectedId),
    [sessions, selectedId]
  );

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = sessions;
    if (filter !== "all") {
      const map: Record<"all" | "upcoming" | "completed" | "canceled", SessionStatus | "all"> = {
        all: "all",
        upcoming: "Upcoming",
        completed: "Completed",
        canceled: "Canceled",
      };
      const want = map[filter];
      if (want !== "all") list = list.filter((s) => (s.status ?? "Upcoming") === want);
    }

    if (!q) return list;

    return list.filter((s) => {
      const name = getClientName(s.clientId).toLowerCase();
      const hay = `${name} ${s.date} ${(s.type ?? "")} ${(s.status ?? "")}`.toLowerCase();
      return hay.includes(q);
    });
  }, [sessions, query, filter]);

  function upsert(next: Session) {
    setSessions((prev) => {
      const idx = prev.findIndex((s) => s.id === next.id);
      const copy = prev.slice();
      if (idx === -1) copy.unshift(next);
      else copy[idx] = next;
      return copy.slice().sort(compareByDate);
    });
  }

  function onNewSession() {
    // Simple demo: create a session with first client that belongs to therapist in mock
    const myClient = clients.find((c) => (c as any).therapistId === therapistId) ?? clients[0];
    const id = uid("sess");
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(10, 0, 0, 0);

    const next: Session = {
      id,
      therapistId,
      clientId: myClient?.id ?? "c1",
      date: d.toISOString(),
      status: "Upcoming",
      type: "Individual",
      notesPreview: "New session created. Add details or reschedule as needed.",
    };

    upsert(next);
    setSelectedId(id);
  }

  function onOpenReschedule() {
    if (!selected) return;
    setDraftDate(selected.date);
    setRescheduleOpen(true);
  }

  function onConfirmReschedule() {
    if (!selected) return;
    if (!draftDate.trim()) return;

    upsert({
      ...selected,
      date: draftDate,
      status: "Upcoming",
    });

    setRescheduleOpen(false);
  }

  function onCancelSession() {
    if (!selected) return;
    upsert({ ...selected, status: "Canceled" });
  }

  function onMarkCompleted() {
    if (!selected) return;
    upsert({ ...selected, status: "Completed" });
  }

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* HEADER */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            Scheduling
          </div>
          <h1 className="mt-2 text-2xl sm:text-2xl font-semibold tracking-tight text-gray-900">Sessions</h1>
          <p className="mt-1 text-sm text-gray-600 max-w-2xl">
            Upcoming and past sessions for{" "}
            <span className="font-semibold text-gray-900">
              {useTherapistProfile(
                therapistId,
                therapist?.name ?? therapistId,
                (therapist as any)?.email ?? "therapist@innery.com"
              ).name}
            </span>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onNewSession}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 transition"
          >
            <PlusIcon />
            New session
          </button>
        </div>
      </header>

      {/* TOOLBAR */}
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
            <SearchIcon />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search sessions…"
            aria-label="Search sessions"
            className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-3 py-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <FilterButton active={filter === "all"} onClick={() => setFilter("all")}>
            All
          </FilterButton>
          <FilterButton active={filter === "upcoming"} onClick={() => setFilter("upcoming")}>
            Upcoming
          </FilterButton>
          <FilterButton active={filter === "completed"} onClick={() => setFilter("completed")}>
            Completed
          </FilterButton>
          <FilterButton active={filter === "canceled"} onClick={() => setFilter("canceled")}>
            Canceled
          </FilterButton>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LIST */}
        <aside className="lg:col-span-4 rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Your sessions</h2>
              <p className="mt-0.5 text-xs text-gray-500">Click a session to view details</p>
            </div>
            <span className="text-xs font-semibold text-gray-400">{filtered.length}</span>
          </div>

          <div className="p-4 space-y-3 max-h-90 lg:max-h-[calc(100vh-260px)] overflow-auto">
            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center">
                <p className="text-sm font-medium text-gray-900">No sessions found</p>
                <p className="mt-1 text-xs text-gray-500">Try a different search or filter.</p>
              </div>
            ) : (
              filtered.map((s) => (
                <SessionCard
                  key={s.id}
                  selected={s.id === selectedId}
                  clientName={getClientName(s.clientId)}
                  date={toNiceDate(s.date)}
                  status={(s.status ?? "Upcoming") as SessionStatus}
                  type={s.type ?? "Individual"}
                  onClick={() => setSelectedId(s.id)}
                />
              ))
            )}
          </div>
        </aside>

        {/* DETAILS */}
        <div className="lg:col-span-8 rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          {!selected ? (
            <div className="p-10 text-center">
              <h3 className="text-base font-semibold text-gray-900">Select a session</h3>
              <p className="mt-2 text-sm text-gray-600">Choose a session on the left, or create a new one.</p>
              <button
                type="button"
                onClick={onNewSession}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 transition"
              >
                <PlusIcon />
                New session
              </button>
            </div>
          ) : (
            <>
              <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-100 px-6 py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">{getClientName(selected.clientId)}</h2>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusPillClass((selected.status ?? "Upcoming") as SessionStatus)}`}> 
                        {selected.status ?? "Upcoming"}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700 ring-1 ring-gray-200">
                        {selected.type ?? "Individual"}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700 ring-1 ring-gray-200">
                        {toNiceDate(selected.date)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/therapist/${therapistId}/clients/${selected.clientId}`}
                      className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition"
                    >
                      <UserIcon />
                      View client
                    </Link>

                    <button
                      type="button"
                      onClick={onOpenReschedule}
                      className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition"
                    >
                      <CalendarIcon />
                      Reschedule
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-5 space-y-6">
                <div className="rounded-2xl border border-gray-100 bg-gray-50/40 p-5">
                  <div className="text-xs font-semibold tracking-wide text-gray-500">DETAILS</div>
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-xs text-gray-500">Client</div>
                      <div className="mt-1 font-semibold text-gray-900">{getClientName(selected.clientId)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Date</div>
                      <div className="mt-1 font-semibold text-gray-900">{toNiceDate(selected.date)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Type</div>
                      <div className="mt-1 font-semibold text-gray-900">{selected.type ?? "Individual"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Status</div>
                      <div className="mt-1 font-semibold text-gray-900">{selected.status ?? "Upcoming"}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900">Quick summary</h3>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={onMarkCompleted}
                        className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition"
                      >
                        Mark completed
                      </button>
                      <button
                        type="button"
                        onClick={onCancelSession}
                        className="inline-flex items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 shadow-sm hover:bg-rose-100 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-gray-700">
                    {selected.notesPreview ?? "Add a brief summary after the session."}
                  </p>

                  <p className="mt-3 text-xs text-gray-400">
                    Demo mode • changes are kept in-memory (no backend yet)
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* RESCHEDULE MODAL */}
      {rescheduleOpen && selected ? (
        <div
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onMouseDown={() => setRescheduleOpen(false)}
        >
          <div
            className="mx-auto mt-24 w-[92%] max-w-lg rounded-2xl bg-white shadow-xl border border-gray-100"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Reschedule session</h3>
                <p className="mt-1 text-sm text-gray-600">Pick a new date/time for this session.</p>
              </div>
              <button
                type="button"
                onClick={() => setRescheduleOpen(false)}
                className="rounded-xl p-2 text-gray-500 hover:bg-gray-100 transition"
                aria-label="Close"
              >
                <XIcon />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="text-sm text-gray-700">
                <div className="text-xs text-gray-500">Client</div>
                <div className="mt-1 font-semibold text-gray-900">{getClientName(selected.clientId)}</div>
              </div>

              <label className="block">
                <span className="text-xs font-semibold text-gray-500">New date</span>
                <input
                  type="datetime-local"
                  value={toDateTimeLocal(draftDate)}
                  onChange={(e) => setDraftDate(fromDateTimeLocal(e.target.value))}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </label>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRescheduleOpen(false)}
                  className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={onConfirmReschedule}
                  className="inline-flex items-center justify-center rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 transition"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function toDateTimeLocal(raw: string) {
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDateTimeLocal(v: string) {
  // datetime-local has no timezone; interpret as local and convert to ISO
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString();
}

function FilterButton({
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
      className={
        "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium shadow-sm transition " +
        (active
          ? "border-indigo-200 bg-indigo-50 text-indigo-700"
          : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50")
      }
    >
      {children}
    </button>
  );
}

function SessionCard({
  clientName,
  date,
  status,
  type,
  selected,
  onClick,
}: {
  clientName: string;
  date: string;
  status: SessionStatus;
  type: string;
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group relative w-full text-left rounded-2xl border p-4 shadow-sm transition",
        selected
          ? "border-indigo-200 bg-indigo-50/40 shadow-md"
          : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-md",
      ].join(" ")}
    >
      <span
        className={[
          "absolute left-0 top-3 bottom-3 w-1 rounded-full transition",
          selected ? "bg-indigo-500" : "bg-transparent group-hover:bg-indigo-200",
        ].join(" ")}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-gray-900 truncate">{clientName}</div>
          <div className="mt-1 text-xs text-gray-500">{date}</div>
        </div>

        <span className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${statusPillClass(status)}`}>
          {status}
        </span>
      </div>

      <div className="mt-3 text-xs text-gray-500">{type}</div>
    </button>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16.5 16.5 21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M7 3.75v2.5M17 3.75v2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M5.5 7.25h13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="M6.25 5.5h11.5A1.75 1.75 0 0 1 19.5 7.25v12A2 2 0 0 1 17.5 21.25h-11A2 2 0 0 1 4.5 19.25v-12A1.75 1.75 0 0 1 6.25 5.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M12 12.25a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M20 21.25c0-4-3-6.5-8-6.5s-8 2.5-8 6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}