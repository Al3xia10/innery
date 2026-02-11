"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { apiFetch } from "@/app/_lib/authClient";

type SessionStatus = "Scheduled" | "Completed" | "Canceled" | "NoShow";
type SessionType = "Individual" | "Couple" | "Group";

type Session = {
  id: string;
  therapistId: string;
  clientUserId: string; // client user id (User.id)
  clientName: string;
  startsAt: string; // ISO string
  durationMin?: number;
  status?: SessionStatus;
  type?: SessionType;
  notesPreview?: string | null;
};

type Note = {
  id: string;
  content: string;
  createdAt: string;
};

type ClientOption = { id: string; name: string };

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
  const da = new Date(a.startsAt).getTime();
  const db = new Date(b.startsAt).getTime();
  if (Number.isNaN(da) || Number.isNaN(db)) return a.startsAt.localeCompare(b.startsAt);
  return da - db;
}


function statusPillClass(status: SessionStatus) {
  switch (status) {
    case "Scheduled":
      return "bg-indigo-50 text-indigo-700 ring-indigo-100";
    case "Completed":
      return "bg-emerald-50 text-emerald-700 ring-emerald-100";
    case "Canceled":
      return "bg-rose-50 text-rose-700 ring-rose-100";
    case "NoShow":
      return "bg-amber-50 text-amber-800 ring-amber-100";
  }
}

export default function TherapistSessionsPage() {
  const params = useParams<{ therapistId: string }>();
  const therapistId = params?.therapistId ?? "t1";

  const [sessions, setSessions] = React.useState<Session[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [therapistName, setTherapistName] = React.useState<string>(therapistId);
  const [selectedId, setSelectedId] = React.useState<string>("");
  const [query, setQuery] = React.useState<string>("");
    const [filter, setFilter] = React.useState<"all" | "scheduled" | "completed" | "canceled" | "noshow">("all");
  const [creatingSession, setCreatingSession] = React.useState(false);

  // Create modal
  const [createOpen, setCreateOpen] = React.useState(false);
  const [createClients, setCreateClients] = React.useState<ClientOption[]>([]);
  const [createClientsLoading, setCreateClientsLoading] = React.useState(false);
  const [createError, setCreateError] = React.useState<string | null>(null);

  const [formClientId, setFormClientId] = React.useState<string>("");
  const [formDateLocal, setFormDateLocal] = React.useState<string>(""); // datetime-local value
  const [formDuration, setFormDuration] = React.useState<number>(50);
  const [formType, setFormType] = React.useState<SessionType>("Individual");
  const [formSummary, setFormSummary] = React.useState<string>("");

  // Reschedule modal
  const [rescheduleOpen, setRescheduleOpen] = React.useState(false);
  const [draftDate, setDraftDate] = React.useState<string>("");

  // Notes (per session)
  const [notes, setNotes] = React.useState<Note[]>([]);
  const [notesLoading, setNotesLoading] = React.useState(false);
  const [notesError, setNotesError] = React.useState<string | null>(null);
  const [noteDraft, setNoteDraft] = React.useState("");
  const [noteSaving, setNoteSaving] = React.useState(false);

  React.useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        // who am I (therapist)?
        const me = await apiFetch("/api/me", { method: "GET" });
        if (alive) setTherapistName(me?.user?.name ?? therapistId);

        // sessions for this therapist
        const data = await apiFetch(`/api/therapists/${therapistId}/sessions`, { method: "GET" });

        const next: Session[] = (data?.sessions ?? []).map((s: any) => ({
          id: String(s.id),
          therapistId: String(s.therapistId ?? therapistId),
          clientUserId: String(s.clientUserId),
          clientName: String(s?.clientUser?.name ?? "Unknown client"),
          startsAt: String(s.startsAt),
          durationMin: typeof s.durationMin === "number" ? s.durationMin : undefined,
          status: (s.status ?? "Scheduled") as SessionStatus,
          type: (s.type ?? "Individual") as SessionType,
          notesPreview:
            (s.notesPreview != null ? String(s.notesPreview) : null) ??
            "Session details are stored privately. Add a brief summary after the call.",
        }));

        // Sort by date ascending (same as old behavior)
        next.sort(compareByDate);

        if (alive) {
          setSessions(next);
          setSelectedId(next[0]?.id ?? "");
          setQuery("");
          setFilter("all");
          setRescheduleOpen(false);
          setDraftDate("");
          setNoteDraft("");
        }
      } catch (e: any) {
        if (alive) setError(e?.message || "Failed to load sessions");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [therapistId]);
  React.useEffect(() => {
    if (!selectedId) return;

    let alive = true;

    (async () => {
      try {
        setNotesLoading(true);
        setNotesError(null);
        setNoteDraft("");

        const data = await apiFetch(
          `/api/therapists/${therapistId}/sessions/${selectedId}/notes`,
          { method: "GET" }
        );

        const next: Note[] = (data?.notes ?? []).map((n: any) => ({
          id: String(n.id),
          content: String(n.content ?? ""),
          createdAt: String(n.createdAt ?? new Date().toISOString()),
        }));

        if (alive) setNotes(next);
      } catch (e: any) {
        if (alive) setNotesError(e?.message || "Failed to load notes");
      } finally {
        if (alive) setNotesLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [therapistId, selectedId]);

  const selected = React.useMemo(
    () => sessions.find((s) => s.id === selectedId),
    [sessions, selectedId]
  );

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = sessions;
    if (filter !== "all") {
      const map: Record<"all" | "scheduled" | "completed" | "canceled" | "noshow", SessionStatus | "all"> = {
        all: "all",
        scheduled: "Scheduled",
        completed: "Completed",
        canceled: "Canceled",
        noshow: "NoShow",
      };
      const want = map[filter];
      if (want !== "all") list = list.filter((s) => (s.status ?? "Scheduled") === want);
    }

    if (!q) return list;

    return list.filter((s) => {
      const name = (s.clientName ?? "unknown").toLowerCase();
      const hay = `${name} ${s.startsAt} ${(s.status ?? "")}`.toLowerCase();
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

  function defaultTomorrow10Local(): string {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(10, 0, 0, 0);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  async function loadLinkedClientsForCreate(): Promise<ClientOption[]> {
    // if already loaded, return what we have
    if (createClients.length > 0) return createClients;
    if (createClientsLoading) return createClients;

    setCreateError(null);
    try {
      setCreateClientsLoading(true);
      const clientsData = await apiFetch(`/api/therapists/${therapistId}/clients`, { method: "GET" });
      const linked = (clientsData?.clients ?? []).filter((c: any) => c.kind === "linked");

      const opts: ClientOption[] = linked.map((c: any) => ({
        id: String(c.user?.id ?? c.id),
        name: String(c.user?.name ?? c.name ?? c.email ?? "Client"),
      }));

      setCreateClients(opts);
      if (!formClientId && opts[0]?.id) setFormClientId(opts[0].id);
      return opts;
    } catch (e: any) {
      setCreateError(e?.message || "Failed to load clients");
      return [];
    } finally {
      setCreateClientsLoading(false);
    }
  }

  function openCreateModal() {
    setCreateError(null);
    setFormDateLocal(defaultTomorrow10Local());
    setFormDuration(50);
    setFormType("Individual");
    setFormSummary("");
    setCreateOpen(true);
    void loadLinkedClientsForCreate();
  }

  function closeCreateModal() {
    setCreateOpen(false);
  }

  async function onCreateSessionConfirm() {
    if (!formClientId) {
      setCreateError("Please select a client.");
      return;
    }
    if (!formDateLocal.trim()) {
      setCreateError("Please choose a date/time.");
      return;
    }

    try {
      setCreatingSession(true);
      setCreateError(null);

      const payload = {
        clientUserId: Number(formClientId),
        startsAt: new Date(formDateLocal).toISOString(),
        durationMin: Number(formDuration) || 50,
        status: "Scheduled",
        type: formType,
        notesPreview: formSummary.trim() ? formSummary.trim() : null,
      };

      const data = await apiFetch(`/api/therapists/${therapistId}/sessions`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const s = data?.session;
      if (!s) throw new Error("Failed to create session");

      const created: Session = {
        id: String(s.id),
        therapistId: String(s.therapistId ?? therapistId),
        clientUserId: String(s.clientUserId),
        clientName: String(s?.clientUser?.name ?? "Unknown client"),
        startsAt: String(s.startsAt),
        durationMin: typeof s.durationMin === "number" ? s.durationMin : undefined,
        status: (s.status ?? "Scheduled") as SessionStatus,
        type: (s.type ?? formType ?? "Individual") as SessionType,
        notesPreview: s.notesPreview ?? null,
      };

      upsert(created);
      setSelectedId(created.id);
      closeCreateModal();
    } catch (e: any) {
      setCreateError(e?.message || "Failed to create session");
    } finally {
      setCreatingSession(false);
    }
  }

  async function onNewSession() {
    const opts = await loadLinkedClientsForCreate();
    if (opts.length === 0) {
      alert("You need at least one linked client before creating a session.");
      return;
    }
    openCreateModal();
  }

  // PATCH session helper for status/dates/notes
  async function patchSession(sessionId: string, patch: Partial<{ startsAt: string; status: SessionStatus; notesPreview: string | null }>) {
    const data = await apiFetch(`/api/therapists/${therapistId}/sessions/${sessionId}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });

    const s = data?.session;
    if (!s) return;

    const next: Session = {
      id: String(s.id),
      therapistId: String(s.therapistId ?? therapistId),
      clientUserId: String(s.clientUserId),
      clientName: String(s?.clientUser?.name ?? selected?.clientName ?? "Unknown client"),
      startsAt: String(s.startsAt),
      durationMin: typeof s.durationMin === "number" ? s.durationMin : undefined,
      status: (s.status ?? "Scheduled") as SessionStatus,
      type: (s.type ?? selected?.type ?? "Individual") as SessionType,
      notesPreview: s.notesPreview != null ? String(s.notesPreview) : null,
    };

    upsert(next);
  }

  function onOpenReschedule() {
    if (!selected) return;
    setDraftDate(selected.startsAt);
    setRescheduleOpen(true);
  }

  async function onConfirmReschedule() {
    if (!selected) return;
    if (!draftDate.trim()) return;
    await patchSession(selected.id, { startsAt: draftDate, status: "Scheduled" });
    setRescheduleOpen(false);
  }

  async function onCancelSession() {
    if (!selected) return;
    await patchSession(selected.id, { status: "Canceled" });
  }

  async function onMarkCompleted() {
    if (!selected) return;
    await patchSession(selected.id, { status: "Completed" });
  }

  async function onMarkNoShow() {
    if (!selected) return;
    await patchSession(selected.id, { status: "NoShow" });
  }

  async function onSaveNote() {
    if (!selected) return;

    const content = noteDraft.trim();
    if (!content) return;

    try {
      setNoteSaving(true);
      setNotesError(null);

      const data = await apiFetch(
        `/api/therapists/${therapistId}/sessions/${selected.id}/notes`,
        {
          method: "POST",
          body: JSON.stringify({ content }),
        }
      );

      const created: Note = {
        id: String(data?.note?.id ?? uid("note")),
        content: String(data?.note?.content ?? content),
        createdAt: String(data?.note?.createdAt ?? new Date().toISOString()),
      };

      // Backend is DESC; put newest first
      setNotes((prev) => {
        const without = prev.filter((n) => n.id !== created.id);
        return [created, ...without];
      });
      setNoteDraft("");
    } catch (e: any) {
      setNotesError(e?.message || "Failed to save note");
    } finally {
      setNoteSaving(false);
    }
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
              {therapistName}
            </span>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onNewSession}
            disabled={creatingSession}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 transition disabled:opacity-50"
          >
            <PlusIcon />
            {creatingSession ? "Creating…" : "New session"}
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
          <FilterButton active={filter === "scheduled"} onClick={() => setFilter("scheduled")}>
            Scheduled
          </FilterButton>
          <FilterButton active={filter === "completed"} onClick={() => setFilter("completed")}>
            Completed
          </FilterButton>
          <FilterButton active={filter === "canceled"} onClick={() => setFilter("canceled")}>
            Canceled
          </FilterButton>
          <FilterButton active={filter === "noshow"} onClick={() => setFilter("noshow")}>
            No-show
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
            {loading ? (
              <div className="rounded-2xl border border-gray-100 bg-white p-6 text-sm text-gray-700">
                Loading sessions…
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
                {error}
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center">
                <p className="text-sm font-medium text-gray-900">No sessions found</p>
                <p className="mt-1 text-xs text-gray-500">Try a different search or filter.</p>
              </div>
            ) : (
              filtered.map((s) => (
                <SessionCard
                  key={s.id}
                  selected={s.id === selectedId}
                  clientName={s.clientName}
                  date={toNiceDate(s.startsAt)}
                  status={(s.status ?? "Scheduled") as SessionStatus}
                  type={String(s.type ?? "Individual")}
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
                disabled={creatingSession}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 transition disabled:opacity-50"
              >
                <PlusIcon />
                {creatingSession ? "Creating…" : "New session"}
              </button>
            </div>
          ) : (
            <>
              <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-100 px-6 py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">{selected.clientName}</h2>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusPillClass((selected.status ?? "Scheduled") as SessionStatus)}`}> 
                        {selected.status ?? "Scheduled"}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700 ring-1 ring-gray-200">
                        {selected.type ?? "Individual"}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700 ring-1 ring-gray-200">
                        {toNiceDate(selected.startsAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/therapist/${therapistId}/clients/${selected.clientUserId}`}
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
                      <div className="mt-1 font-semibold text-gray-900">{selected.clientName}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Date</div>
                      <div className="mt-1 font-semibold text-gray-900">{toNiceDate(selected.startsAt)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Status</div>
                      <div className="mt-1 font-semibold text-gray-900">{selected.status ?? "Scheduled"}</div>
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
                        onClick={onMarkNoShow}
                        className="inline-flex items-center justify-center rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800 shadow-sm hover:bg-amber-100 transition"
                      >
                        No-show
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

                  <div className="mt-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-900">Session notes</h3>
                      <span className="text-xs text-gray-500">{notes.length} note(s)</span>
                    </div>

                    <div className="mt-3 space-y-2">
                      <textarea
                        className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-900 outline-none focus:border-gray-300"
                        rows={4}
                        placeholder="Write a private note for this session…"
                        value={noteDraft}
                        onChange={(e) => setNoteDraft(e.target.value)}
                      />

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={onSaveNote}
                          disabled={noteSaving || !noteDraft.trim()}
                          className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                        >
                          {noteSaving ? "Saving…" : "Save note"}
                        </button>

                        {notesLoading ? (
                          <span className="text-xs text-gray-500">Loading notes…</span>
                        ) : null}
                      </div>

                      {notesError ? (
                        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                          {notesError}
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-4 space-y-3">
                      {notesLoading ? null : notes.length === 0 ? (
                        <div className="rounded-xl border border-gray-100 bg-white p-4 text-sm text-gray-600">
                          No saved notes yet. Add your first note above.
                        </div>
                      ) : (
                        notes.map((n) => (
                          <div key={n.id} className="rounded-xl border border-gray-100 bg-white p-4">
                            <div className="text-xs text-gray-500">
                              {new Date(n.createdAt).toLocaleString()}
                            </div>
                            <div className="mt-2 whitespace-pre-wrap text-sm text-gray-900">
                              {n.content}
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <p className="mt-3 text-xs text-gray-400">
                      Saved to your private workspace • therapist: <span className="font-medium">{therapistName}</span>
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      {/* CREATE SESSION MODAL */}
      {createOpen ? (
        <div
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onMouseDown={closeCreateModal}
        >
          <div
            className="mx-auto mt-20 w-[92%] max-w-xl rounded-2xl bg-white shadow-xl border border-gray-100"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-900">New session</h3>
                <p className="mt-1 text-sm text-gray-600">Set the date/time, type and a short summary.</p>
              </div>
              <button
                type="button"
                onClick={closeCreateModal}
                className="rounded-xl p-2 text-gray-500 hover:bg-gray-100 transition"
                aria-label="Close"
              >
                <XIcon />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <label className="block">
                <span className="text-xs font-semibold text-gray-500">Client</span>
                <select
                  value={formClientId}
                  onChange={(e) => setFormClientId(e.target.value)}
                  onFocus={() => void loadLinkedClientsForCreate()}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {createClientsLoading ? (
                    <option value="">Loading…</option>
                  ) : createClients.length === 0 ? (
                    <option value="">No linked clients</option>
                  ) : (
                    createClients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))
                  )}
                </select>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-xs font-semibold text-gray-500">Date & time</span>
                  <input
                    type="datetime-local"
                    value={formDateLocal}
                    onChange={(e) => setFormDateLocal(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-semibold text-gray-500">Duration (min)</span>
                  <input
                    type="number"
                    min={10}
                    max={600}
                    value={formDuration}
                    onChange={(e) => setFormDuration(Number(e.target.value))}
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-xs font-semibold text-gray-500">Type</span>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as SessionType)}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Individual">Individual</option>
                  <option value="Couple">Couple</option>
                  <option value="Group">Group</option>
                </select>
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-gray-500">Summary (optional)</span>
                <textarea
                  rows={3}
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  placeholder="Short private summary…"
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </label>

              {createError ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                  {createError}
                </div>
              ) : null}

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={onCreateSessionConfirm}
                  disabled={creatingSession}
                  className="inline-flex items-center justify-center rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 transition disabled:opacity-50"
                >
                  {creatingSession ? "Creating…" : "Create session"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
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
                <div className="mt-1 font-semibold text-gray-900">{selected.clientName}</div>
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