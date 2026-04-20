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
function statusLabel(status: SessionStatus) {
  switch (status) {
    case "Scheduled":
      return "Programată";
    case "Completed":
      return "Finalizată";
    case "Canceled":
      return "Anulată";
    case "NoShow":
      return "Neprezentare";
  }
}

function typeLabel(type: SessionType | string) {
  if (type === "Individual") return "Individuală";
  if (type === "Couple") return "Cuplu";
  if (type === "Group") return "Grup";
  return type;
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
    const [completingSessionId, setCompletingSessionId] = React.useState<string | null>(null);

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
          clientName: String(s?.clientUser?.name ?? "Client necunoscut"),
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
        if (alive) setError(e?.message || "Nu am putut încărca ședințele");
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
        if (alive) setNotesError(e?.message || "Nu am putut încărca notițele");
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
      setCreateError(e?.message || "Nu am putut încărca clienții");
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
      setCreateError("Selectează un client.");
      return;
    }
    if (!formDateLocal.trim()) {
      setCreateError("Alege o dată și o oră.");
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
      if (!s) throw new Error("Nu am putut crea ședința");

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
      setCreateError(e?.message || "Nu am putut crea ședința");
    } finally {
      setCreatingSession(false);
    }
  }

  async function onNewSession() {
    const opts = await loadLinkedClientsForCreate();
    if (opts.length === 0) {
      alert("Ai nevoie de cel puțin un client conectat înainte să creezi o ședință.");
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

  async function onDeleteSession() {
    if (!selected) return;

    const ok = window.confirm("Ștergi permanent această ședință?");
    if (!ok) return;

    try {
      await apiFetch(`/api/therapists/${therapistId}/sessions/${selected.id}`, {
        method: "DELETE",
      });

      setSessions((prev) => {
        const next = prev.filter((s) => s.id !== selected.id);
        const replacement = next[0]?.id ?? "";
        setSelectedId(replacement);
        return next;
      });

      setNotes([]);
      setNotesError(null);
      setNoteDraft("");
      setRescheduleOpen(false);
    } catch (e: any) {
      alert(e?.message || "Nu am putut șterge ședința");
    }
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

    const completedId = selected.id;

    await patchSession(completedId, { status: "Completed" });
    setCompletingSessionId(completedId);

    window.setTimeout(() => {
      setSessions((prev) => {
        const next = prev.filter((s) => s.id !== completedId);
        const replacement = next[0]?.id ?? "";
        setSelectedId(replacement);
        return next;
      });

      setNotes([]);
      setNotesError(null);
      setNoteDraft("");
      setRescheduleOpen(false);
      setCompletingSessionId((current) => (current === completedId ? null : current));
    }, 900);
  }

  async function onMarkNoShow() {
    if (!selected) return;
    await patchSession(selected.id, { status: "NoShow" });
  }
    async function onResetToScheduled() {
    if (!selected) return;
    await patchSession(selected.id, { status: "Scheduled" });
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
      setNotesError(e?.message || "Nu am putut salva notița");
    } finally {
      setNoteSaving(false);
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-3 py-3 sm:px-6 sm:py-6 lg:px-8">
      {/* HEADER */}
      <section
        className="overflow-hidden rounded-[28px] border border-black/5 shadow-sm sm:rounded-4xl"
        style={{
          background:
            "linear-gradient(135deg, #ffffff 0%, rgba(239,208,202,0.18) 60%, rgba(125,128,218,0.08) 100%)",
        }}
      >
        <div className="flex flex-col gap-4 p-4 sm:p-7 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            

            <h1 className="mt-4 w-full text-[2rem] font-semibold leading-[1.02] tracking-tight text-slate-900 sm:text-4xl">
          Ședințe
        </h1>
        <p className="mt-3 max-w-[30ch] text-[14px] leading-7 text-[#6B5A63] sm:max-w-2xl sm:text-base">
          Ședințele viitoare și trecute ale lui <span className="font-semibold text-slate-900">{therapistName}</span>,
          toate într-un singur workspace liniștit.
        </p>

            <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
  <div className="rounded-[20px] bg-white/80 px-4 py-3 shadow-[0_6px_16px_rgba(31,23,32,0.04)] ring-1 ring-black/5 backdrop-blur-sm">
    <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#6B5A63]">Total</p>
    <p className="mt-2 text-[1.3rem] font-semibold leading-none text-slate-900">{sessions.length}</p>
    <p className="mt-1.5 text-xs text-[#6B5A63]">ședințe</p>
  </div>

  <div className="rounded-[20px] bg-white/80 px-4 py-3 shadow-[0_6px_16px_rgba(31,23,32,0.04)] ring-1 ring-black/5 backdrop-blur-sm">
    <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#6B5A63]">Programate</p>
    <p className="mt-2 text-[1.3rem] font-semibold leading-none text-slate-900">
      {sessions.filter((s) => (s.status ?? "Scheduled") === "Scheduled").length}
    </p>
    <p className="mt-1.5 text-xs text-[#6B5A63]">planificate</p>
  </div>

  <div className="col-span-2 rounded-[20px] bg-white/80 px-4 py-3 shadow-[0_6px_16px_rgba(31,23,32,0.04)] ring-1 ring-black/5 backdrop-blur-sm sm:col-span-1">
    <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#6B5A63]">Finalizate</p>
    <p className="mt-2 text-[1.3rem] font-semibold leading-none text-slate-900">
      {sessions.filter((s) => s.status === "Completed").length}
    </p>
    <p className="mt-1.5 text-xs text-[#6B5A63]">încheiate</p>
  </div>
</div>
          </div>

          <div className="mt-2 grid w-full grid-cols-1 gap-2.5 self-start sm:flex sm:w-auto sm:items-center sm:gap-3">
            <button
  type="button"
  onClick={onNewSession}
  disabled={creatingSession}
  className="mt-1 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[20px] bg-(--color-accent) px-4 py-3 text-center text-sm font-semibold leading-5 text-white shadow-[0_10px_24px_rgba(184,104,152,0.22)] transition hover:-translate-y-px hover:opacity-90 disabled:opacity-50 sm:min-w-36 sm:w-auto sm:whitespace-nowrap sm:rounded-2xl sm:px-5"
>
  <PlusIcon />
  {creatingSession ? "Se creează…" : "Ședință nouă"}
</button>
          </div>
        </div>
      </section>

      {/* TOOLBAR */}
      <div className="mt-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <label className="relative block w-full xl:max-w-115">
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
            <SearchIcon />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Caută în ședințe…"
            aria-label="Caută în ședințe"
            className="w-full rounded-2xl border border-black/5 bg-white/90 py-3 pl-10 pr-10 text-sm text-gray-900 shadow-[0_6px_16px_rgba(31,23,32,0.04)] ring-1 ring-(--color-soft)/45 placeholder:text-gray-500 outline-none transition focus:border-(--color-soft) focus:bg-white focus:ring-2 focus:ring-(--color-soft)"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 transition hover:bg-(--color-card) hover:text-slate-700"
              aria-label="Șterge căutarea"
            >
              <XIcon />
            </button>
          ) : null}
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <FilterButton active={filter === "all"} onClick={() => setFilter("all")}>Toate</FilterButton>
<FilterButton active={filter === "scheduled"} onClick={() => setFilter("scheduled")}>Programate</FilterButton>
<FilterButton active={filter === "completed"} onClick={() => setFilter("completed")}>Finalizate</FilterButton>
<FilterButton active={filter === "canceled"} onClick={() => setFilter("canceled")}>Anulate</FilterButton>
<FilterButton active={filter === "noshow"} onClick={() => setFilter("noshow")}>Neprezentare</FilterButton>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-12 xl:grid-cols-[1.08fr_1.92fr]">
        {/* LIST */}
        <aside className="overflow-hidden rounded-[28px] border border-black/5 bg-white/90 shadow-[0_12px_28px_rgba(31,23,32,0.05)] sm:rounded-4xl xl:col-span-1">
          <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Ședințele tale</h2>
<p className="mt-0.5 text-xs text-[#6B5A63]">Apasă pe o ședință pentru a vedea detaliile</p>
            </div>
            <span className="text-xs font-semibold text-gray-400">{filtered.length}</span>
          </div>

          <div className="max-h-90 space-y-3 overflow-auto p-3 sm:p-4 lg:max-h-[calc(100vh-260px)]">
            {loading ? (
              <div className="rounded-2xl border border-black/5 bg-white/85 p-6 text-sm text-gray-700 shadow-[0_4px_12px_rgba(31,23,32,0.04)]">
                Se încarcă ședințele…
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 shadow-[0_4px_12px_rgba(31,23,32,0.04)]">
                {error}
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-black/10 bg-(--color-card) p-6 text-center shadow-[0_4px_12px_rgba(31,23,32,0.03)]">
            <p className="text-sm font-medium text-gray-900">Nu am găsit ședințe</p>
            <p className="mt-1 text-xs text-[#6B5A63]">Încearcă altă căutare sau alt filtru.</p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setQuery("")}
                className="inline-flex items-center justify-center rounded-xl border border-black/5 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-(--color-card)"
              >
                Șterge căutarea
              </button>

              <button
                type="button"
                onClick={() => setFilter("all")}
                className="inline-flex items-center justify-center rounded-xl border border-black/5 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-(--color-card)"
              >
                Resetează filtrele
              </button>
            </div>
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
        <div className="overflow-hidden rounded-[28px] border border-black/5 bg-white/90 shadow-[0_12px_28px_rgba(31,23,32,0.05)] sm:rounded-4xl xl:col-span-1">
          {!selected ? (
            <div className="p-10 text-center">
              <h3 className="text-base font-semibold text-gray-900">Selectează o ședință</h3>
<p className="mt-2 text-sm text-gray-600">Alege o ședință din stânga sau creează una nouă.</p>
              <button
                type="button"
                onClick={onNewSession}
                disabled={creatingSession}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-(--color-accent) px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(184,104,152,0.22)] transition hover:opacity-95 disabled:opacity-50"
              >
                <PlusIcon />
                {creatingSession ? "Se creează…" : "Ședință nouă"}
              </button>
            </div>
          ) : (
            <>
              <div className="sticky top-0 z-10 border-b border-black/5 bg-white/90 px-6 py-4 backdrop-blur">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">{selected.clientName}</h2>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusPillClass((selected.status ?? "Scheduled") as SessionStatus)}`}> 
                        {statusLabel((selected.status ?? "Scheduled") as SessionStatus)}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700 ring-1 ring-gray-200">
                        {typeLabel(selected.type ?? "Individual")}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700 ring-1 ring-gray-200">
                        {toNiceDate(selected.startsAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 sm:justify-end">
                    <Link
                      href={`/therapist/${therapistId}/clients/${selected.clientUserId}`}
                      className="inline-flex items-center gap-2 rounded-xl border border-black/5 bg-(--color-card) px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-(--color-soft)"
                    >
                      <UserIcon />
                      Vezi clientul
                    </Link>

                    <button
                      type="button"
                      onClick={onOpenReschedule}
                      className="inline-flex items-center gap-2 rounded-xl border border-black/5 bg-(--color-card) px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-(--color-soft)"
                    >
                      <CalendarIcon />
                      Reprogramează
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-5 space-y-6">
                <div
  className={[
    "rounded-2xl border p-5 shadow-[0_4px_12px_rgba(31,23,32,0.03)] transition",
    completingSessionId === selected.id
      ? "border-emerald-200 bg-[#f3fbf6]"
      : "border-black/5 bg-(--color-card)",
  ].join(" ")}
>
                  <div className="text-xs font-semibold tracking-wide text-gray-500">DETALII</div>
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-xs text-gray-500">Client</div>
                      <div className="mt-1 font-semibold text-gray-900">{selected.clientName}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Data</div>
                      <div className="mt-1 font-semibold text-gray-900">{toNiceDate(selected.startsAt)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Status</div>
                      <div className="mt-1 font-semibold text-gray-900">
  {statusLabel((selected.status ?? "Scheduled") as SessionStatus)}
</div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="space-y-4">
  <div className="rounded-3xl border border-black/5 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(252,249,251,0.98)_100%)] p-4 shadow-[0_6px_16px_rgba(31,23,32,0.04)] sm:p-5">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="max-w-sm">
        <h3 className="text-sm font-semibold text-gray-900">Status ședință</h3>
        <p className="mt-1 text-xs leading-6 text-[#6B5A63]">
  {completingSessionId === selected.id
    ? "Marcată ca finalizată. Ședința va dispărea imediat din lista activă."
    : "Alege starea curentă a acestei ședințe. O poți modifica din nou mai târziu."}
</p>
      </div>

      <div className="w-full lg:max-w-90">
        <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onResetToScheduled}
              disabled={(selected.status ?? "Scheduled") === "Scheduled"}
              className={[
  "inline-flex max-h-9 w-full flex-col items-center justify-center rounded-[20px] border px-3 py-3 text-center text-sm font-semibold leading-tight shadow-[0_6px_16px_rgba(31,23,32,0.04)] transition",
  (selected.status ?? "Scheduled") === "Scheduled"
    ? "border-[#dcdcf8] bg-[#f5f4ff] text-[#676cc8]"
    : "border-black/5 bg-white/92 text-gray-700 hover:bg-(--color-card)",
].join(" ")}
            >
                  Programată
            </button>

            <button
              type="button"
              onClick={onMarkCompleted}
              disabled={(selected.status ?? "Scheduled") === "Completed"}
              className={[
  "inline-flex max-h-9 w-full flex-col items-center justify-center rounded-[20px] border px-3 py-3 text-center text-sm font-semibold leading-tight shadow-[0_6px_16px_rgba(31,23,32,0.04)] transition",
  (selected.status ?? "Scheduled") === "Completed"
    ? "border-[#cfead8] bg-[#f3fbf6] text-[#2f865c]"
    : "border-black/5 bg-white/92 text-gray-700 hover:bg-(--color-card)",
].join(" ")}
            >
                  Finalizată
            </button>

            <button
              type="button"
              onClick={onMarkNoShow}
              disabled={(selected.status ?? "Scheduled") === "NoShow"}
              className={[
  "inline-flex max-h-9 w-full flex-col items-center justify-center rounded-[20px] border px-3 py-3 text-center text-sm font-semibold leading-tight shadow-[0_6px_16px_rgba(31,23,32,0.04)] transition",
  (selected.status ?? "Scheduled") === "NoShow"
    ? "border-[#f6dfb4] bg-[#fff8eb] text-[#a56a11]"
    : "border-black/5 bg-white/92 text-gray-700 hover:bg-(--color-card)",
].join(" ")}
            >
                  Neprezentare
            </button>

            <button
              type="button"
              onClick={onCancelSession}
              disabled={(selected.status ?? "Scheduled") === "Canceled"}
              className={[
  "inline-flex max-h-9 w-full flex-col items-center justify-center rounded-[20px] border px-3 py-3 text-center text-sm font-semibold leading-tight shadow-[0_6px_16px_rgba(31,23,32,0.04)] transition",
  (selected.status ?? "Scheduled") === "Canceled"
    ? "border-[#f0cfd6] bg-[#fff6f8] text-[#c4546f]"
    : "border-black/5 bg-white/92 text-gray-700 hover:bg-(--color-card)",
].join(" ")}
            >
                  Anulată
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div className="mt-6 rounded-2xl border border-black/5 bg-white/80 p-4 shadow-[0_4px_12px_rgba(31,23,32,0.03)]">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">Șterge ședința</h3>
<p className="mt-1 text-xs text-[#6B5A63]">
  Elimină permanent această ședință dacă a fost creată din greșeală.
</p>
      </div>

      <button
        type="button"
        onClick={onDeleteSession}
        className="inline-flex items-center justify-center rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 hover:border-rose-300"
      >
        Șterge
      </button>
    </div>
  </div>

 
</div>

                  <div className="mt-6">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="text-sm font-semibold text-gray-900">Notițe de ședință</h3>
<span className="text-xs text-gray-500">
  {notes.length} notiț{notes.length === 1 ? "ă" : "e"}
</span>
                  </div>

                    <div className="mt-3 rounded-2xl border border-black/5 bg-white/85 p-3 shadow-[0_4px_12px_rgba(31,23,32,0.04)]">
                <textarea
                  className="w-full rounded-xl border border-black/5 bg-white p-3 text-sm text-gray-900 shadow-[0_4px_10px_rgba(31,23,32,0.03)] outline-none transition focus:border-(--color-soft)"
                  rows={4}
                  placeholder="Scrie o notiță privată pentru această ședință…"
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                />

                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-xs text-[#6B5A63]">
                    Păstrează acest rezumat scurt, clar și util pentru următorul pas.
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onSaveNote}
                      disabled={noteSaving || !noteDraft.trim()}
                      className="rounded-xl bg-(--color-accent) px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-95 disabled:opacity-50"
                    >
                      {noteSaving ? "Se salvează…" : "Salvează notița"}
                    </button>

                    {notesLoading ? (
                      <span className="text-xs text-gray-500">Se încarcă notițele…</span>
                    ) : null}
                  </div>
                </div>
                </div>

                    <div className="mt-5 space-y-3">
                      {notesLoading ? null : notes.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-black/10 bg-(--color-card) p-4.5 text-sm leading-7 text-[#6B5A63] shadow-[0_4px_12px_rgba(31,23,32,0.03)]">
                          Nu există încă notițe salvate. Adaugă prima notiță mai sus.
                        </div>
                      ) : (
                        notes.map((n) => (
                          <div key={n.id} className="rounded-xl border border-black/5 bg-white/85 p-4.5 shadow-[0_4px_12px_rgba(31,23,32,0.04)]">
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

                    <p className="mt-3 text-xs text-[#6B5A63]">
                      Salvat în workspace-ul tău privat • terapeut: <span className="font-medium">{therapistName}</span>
                    </p>
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
            className="mx-auto mt-20 w-[92%] max-w-xl overflow-hidden rounded-[30px] border border-black/5 bg-white shadow-[0_24px_60px_rgba(31,23,32,0.20)]"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="border-b border-black/5 bg-[linear-gradient(135deg,#ffffff_0%,rgba(239,208,202,0.14)_65%,rgba(125,128,218,0.06)_100%)] px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="mt-3 text-[1.05rem] font-semibold text-gray-900">Ședință nouă</h3>
                  <p className="mt-1 text-sm text-gray-600">Setează data, durata, tipul și un scurt rezumat privat.</p>
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
            </div>

            <div className="px-6 py-5 space-y-4">
              <label className="block">
                <span className="text-xs font-semibold text-gray-500">Client</span>
                <select
                  value={formClientId}
                  onChange={(e) => setFormClientId(e.target.value)}
                  onFocus={() => void loadLinkedClientsForCreate()}
                  className="mt-2 w-full rounded-xl border border-black/5 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-[0_4px_10px_rgba(31,23,32,0.03)] outline-none transition focus:border-(--color-soft)"
                >
                  {createClientsLoading ? (
                    <option value="">Se încarcă…</option>
                  ) : createClients.length === 0 ? (
                    <option value="">Nu există clienți conectați</option>
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
                  <span className="text-xs font-semibold text-gray-500">Data si ora</span>
                  <input
                    type="datetime-local"
                    value={formDateLocal}
                    onChange={(e) => setFormDateLocal(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-black/5 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-[0_4px_10px_rgba(31,23,32,0.03)] outline-none transition focus:border-(--color-soft)"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-semibold text-gray-500">Durată (min)</span>
                  <input
                    type="number"
                    min={10}
                    max={600}
                    value={formDuration}
                    onChange={(e) => setFormDuration(Number(e.target.value))}
                    className="mt-2 w-full rounded-xl border border-black/5 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-[0_4px_10px_rgba(31,23,32,0.03)] outline-none transition focus:border-(--color-soft)"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-xs font-semibold text-gray-500">Tip</span>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as SessionType)}
                  className="mt-2 w-full rounded-xl border border-black/5 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-[0_4px_10px_rgba(31,23,32,0.03)] outline-none transition focus:border-(--color-soft)"
                >
                  <option value="Individual">Individuală</option>
                  <option value="Couple">Cuplu</option>
                  <option value="Group">Grop</option>
                </select>
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-gray-500">Rezumat (opțional)</span>
                <textarea
                  rows={3}
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  placeholder="Rezumat privat scurt…"
                  className="mt-2 w-full rounded-xl border border-black/5 bg-white p-3 text-sm text-gray-900 shadow-[0_4px_10px_rgba(31,23,32,0.03)] outline-none transition focus:border-(--color-soft)"
                />
              </label>

              {createError ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 shadow-[0_4px_12px_rgba(31,23,32,0.03)]">
                  {createError}
                </div>
              ) : null}

              <div className="flex flex-col-reverse gap-3 border-t border-black/5 pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="inline-flex items-center justify-center rounded-xl border border-black/5 bg-(--color-card) px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-(--color-soft)"
                >
                  Renunță
                </button>

                <button
                  type="button"
                  onClick={onCreateSessionConfirm}
                  disabled={creatingSession}
                  className="inline-flex items-center justify-center rounded-xl bg-(--color-accent) px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(184,104,152,0.22)] transition hover:opacity-95 disabled:opacity-50"
                >
                  {creatingSession ? "Se creează…" : "Creează ședința"}
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
            className="mx-auto mt-24 w-[92%] max-w-lg overflow-hidden rounded-[30px] border border-black/5 bg-white shadow-[0_24px_60px_rgba(31,23,32,0.20)]"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="border-b border-black/5 bg-[linear-gradient(135deg,#ffffff_0%,rgba(239,208,202,0.14)_65%,rgba(125,128,218,0.06)_100%)] px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="mt-3 text-[1.05rem] font-semibold text-gray-900">Reprogramează ședința</h3>
                  <p className="mt-1 text-sm text-gray-600">Alege o nouă dată și oră pentru această ședință.</p>
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
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="text-sm text-gray-700">
                <div className="text-xs text-gray-500">Client</div>
                <div className="mt-1 font-semibold text-gray-900">{selected.clientName}</div>
              </div>

              <label className="block">
                <span className="text-xs font-semibold text-gray-500">Dată nouă</span>
                <input
                  type="datetime-local"
                  value={toDateTimeLocal(draftDate)}
                  onChange={(e) => setDraftDate(fromDateTimeLocal(e.target.value))}
                  className="mt-2 w-full rounded-xl border border-black/5 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-[0_4px_10px_rgba(31,23,32,0.03)] outline-none transition focus:border-(--color-soft)"
                />
              </label>

              <div className="flex flex-col-reverse gap-3 border-t border-black/5 pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setRescheduleOpen(false)}
                  className="inline-flex items-center justify-center rounded-xl border border-black/5 bg-(--color-card) px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-(--color-soft)"
                >
                     Renunță
                </button>

                <button
                  type="button"
                  onClick={onConfirmReschedule}
                  className="inline-flex items-center justify-center rounded-xl bg-(--color-accent) px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(184,104,152,0.22)] transition hover:opacity-95"
                >
                    Salvează
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
        "inline-flex items-center gap-2 rounded-[20px] border px-3 py-2 text-sm font-medium shadow-[0_4px_10px_rgba(31,23,32,0.04)] transition " +
        (active
          ? "border-(--color-soft) bg-(--color-card) text-(--color-primary)"
          : "border-black/5 bg-white/85 text-gray-700 hover:bg-white")
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
        "group relative w-full overflow-hidden rounded-[20px] border px-4 py-4 text-left shadow-[0_10px_24px_rgba(31,23,32,0.06)] transition",
        selected
          ? "border-[#ead7df] bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(252,249,251,0.98)_100%)] shadow-[0_12px_28px_rgba(31,23,32,0.08)]"
          : "border-black/5 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(252,249,251,0.98)_100%)] hover:shadow-[0_12px_28px_rgba(31,23,32,0.08)]",
      ].join(" ")}
    >
      <span
      className={[
        "absolute left-4 right-4 top-0 h-px transition",
        selected
          ? "bg-[linear-gradient(90deg,rgba(239,208,202,0.8),transparent)]"
          : "bg-[linear-gradient(90deg,rgba(125,128,218,0.35),transparent)] group-hover:bg-[linear-gradient(90deg,rgba(125,128,218,0.55),transparent)]",
      ].join(" ")}
    />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-[1.02rem] font-semibold tracking-tight text-gray-900">{clientName}</div>
          <div className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-gray-400">{date}</div>
        </div>

        <span className={`shrink-0 inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold shadow-[0_3px_8px_rgba(31,23,32,0.04)] ring-1 ${statusPillClass(status)}`}>
          {statusLabel(status)}
        </span>
      </div>

      <div className="mt-3 text-xs text-[#6B5A63]">{typeLabel(type)}</div>
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
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
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
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}