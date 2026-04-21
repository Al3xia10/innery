"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { apiFetch } from "@/app/_lib/authClient";
import CompactStat from "./components/CompactStat";
import LoadingCard from "./components/LoadingCard";
import ClientRowCard from "./components/ClientRowCard";
import FilterButton from "./components/FilterButton";
import { PlusIcon, SearchIcon, XIcon } from "./components/ClientIcons";

type ClientStatus = "Active" | "Paused" | "Invited";

type Client = {
  id: string;
  kind: "linked" | "invite";
  therapistId: string;
  name: string;
  email?: string;
  status?: ClientStatus;
  lastSession?: string;
};

function mapClientRow(row: any, therapistId: string): Client {
  const kind: "linked" | "invite" = row?.kind === "invite" ? "invite" : "linked";

  if (kind === "invite") {
    return {
      id: String(row?.id ?? row?.invite?.id ?? ""),
      kind: "invite",
      therapistId: String(row?.therapistId ?? therapistId),
      name: String(row?.name ?? row?.email ?? "Invited client"),
      email: String(row?.email ?? ""),
      status: "Invited",
      lastSession: String(row?.lastSession ?? "—"),
    };
  }

  const userId = String(row?.user?.id ?? row?.userId ?? row?.id);
  return {
    id: userId,
    kind: "linked",
    therapistId: String(row?.therapistId ?? therapistId),
    name: String(row?.user?.name ?? row?.name ?? "Client"),
    email: String(row?.user?.email ?? row?.email ?? ""),
    status: (row?.status === "Paused" ? "Paused" : "Active") as ClientStatus,
    lastSession: String(row?.lastSession ?? row?.lastSessionAt ?? "—"),
  };
}

export default function ClientsPage() {
  const params = useParams<{ therapistId: string }>();
  const therapistId = params?.therapistId ?? "";

  const [clients, setClients] = React.useState<Client[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [therapistName, setTherapistName] = React.useState<string>(therapistId);
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"all" | ClientStatus>("all");

  const [open, setOpen] = React.useState(false);
  const [draftEmail, setDraftEmail] = React.useState("");
  const [draftName, setDraftName] = React.useState("");

  const refreshClients = React.useCallback(async () => {
    const data = await apiFetch(`/api/therapists/${therapistId}/clients`, { method: "GET" });
    const next: Client[] = (data?.clients ?? []).map((row: any) => mapClientRow(row, therapistId));
    setClients(next);
  }, [therapistId]);

  React.useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        try {
          const me = await apiFetch("/api/me", { method: "GET" });
          if (alive) setTherapistName(me?.user?.name ?? therapistId);
        } catch {
          if (alive) setTherapistName(therapistId);
        }

        const data = await apiFetch(`/api/therapists/${therapistId}/clients`, { method: "GET" });
        const next: Client[] = (data?.clients ?? []).map((row: any) => mapClientRow(row, therapistId));

        if (alive) setClients(next);
      } catch (e: any) {
        if (alive) setError(e?.message || "Failed to load clients");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [therapistId]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = clients;

    if (statusFilter !== "all") {
      list = list.filter((c) => (c.status ?? (c.kind === "invite" ? "Invited" : "Active")) === statusFilter);
    }

    if (!q) return list;
    return list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        (c.email ? c.email.toLowerCase().includes(q) : false)
    );
  }, [clients, query, statusFilter]);

  const counts = React.useMemo(() => {
    const active = clients.filter((c) => (c.status ?? (c.kind === "invite" ? "Invited" : "Active")) === "Active").length;
    const paused = clients.filter((c) => c.status === "Paused").length;
    const invited = clients.filter((c) => c.kind === "invite").length;
    return {
      total: clients.length,
      active,
      paused,
      invited,
    };
  }, [clients]);

  function onOpenAdd() {
    setDraftEmail("");
    setDraftName("");
    setOpen(true);
  }

  async function onAddClient() {
    const email = draftEmail.trim().toLowerCase();
    const name = draftName.trim();

    if (!email) return;

    try {
      setError(null);
      await apiFetch(`/api/therapists/${therapistId}/clients`, {
        method: "POST",
        body: JSON.stringify({ email, name: name || undefined }),
      });

      setOpen(false);
      setDraftEmail("");
      setDraftName("");
      await refreshClients();
    } catch (e: any) {
      setError(e?.message || "Failed to invite client");
    }
  }

  async function onToggleStatus(clientId: string) {
    const current = clients.find((c) => c.id === clientId);
    if (!current || current.kind === "invite") return;

    const nextStatus: ClientStatus = (current.status ?? "Active") === "Active" ? "Paused" : "Active";

    try {
      setError(null);
      await apiFetch(`/api/therapists/${therapistId}/clients/${clientId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      });
      await refreshClients();
    } catch (e: any) {
      setError(e?.message || "Failed to update status");
    }
  }

  async function onRemove(clientId: string) {
    try {
      setError(null);
      await apiFetch(`/api/therapists/${therapistId}/clients/${clientId}`, { method: "DELETE" });
      await refreshClients();
    } catch (e: any) {
      setError(e?.message || "Failed to delete");
    }
  }

  
  return (
    <section className="mx-auto max-w-7xl px-3 py-3 sm:px-6 sm:py-6 lg:px-8">
      <div
        className="overflow-hidden rounded-[34px] border border-black/5 shadow-sm"
        style={{
          background:
            "linear-gradient(135deg, #ffffff 0%, rgba(239,208,202,0.18) 60%, rgba(125,128,218,0.08) 100%)",
        }}
      >
        <div className="px-4 py-5 sm:px-8 sm:py-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <h1 className="mt-4 text-[2rem] w-full leading-[1.02] font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Clients
              </h1>
              <p className="mt-3 max-w-[30ch] sm:max-w-2xl text-[14px] leading-7 text-[#6B5A63] sm:text-base">
                Gestionează persoanele alocate lui <span className="font-semibold text-slate-900">{therapistName}</span>, invită clienți noi și păstrează workspace-ul organizat.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                <CompactStat title="Total" value={counts.total} subtitle="clienți" />
                <CompactStat title="Activi" value={counts.active} subtitle="în grijă" />
                <CompactStat
                  title="Invitați"
                  value={counts.invited}
                  subtitle="în așteptare"
                  className="col-span-2 sm:col-span-1"
                />
              </div>
            </div>
            <div className="mt-2 grid w-full grid-cols-2 gap-2.5 self-start sm:flex sm:w-auto sm:items-center sm:gap-3">
              <Link
                href={`/therapist/${therapistId}`}
                className="inline-flex w-full sm:w-auto min-h-11 items-center justify-center rounded-2xl border border-black/5 bg-white/85 px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-white sm:rounded-2xl"
              >
                Panou
              </Link>
              <button
                type="button"
                onClick={onOpenAdd}
                className="inline-flex w-full sm:w-auto min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-(--color-accent) px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 sm:rounded-2xl"
              >
                <PlusIcon />
                Adaugă client
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        {loading ? (
          <section
            className="rounded-[28px] sm:rounded-4xl border border-black/5 shadow-sm overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, #ffffff 0%, rgba(239,208,202,0.18) 60%, rgba(125,128,218,0.08) 100%)",
            }}
          >
            <div className="p-5 sm:p-7">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-slate-900">Lista de clienți</h2>
                <p className="mt-1 text-sm text-[#6B5A63]">Se încarcă workspace-ul tău</p>
              </div>
              <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <label className="relative block w-full lg:max-w-md">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <SearchIcon />
                  </span>
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Caută după nume, email sau id"
                    className="w-full rounded-2xl border border-black/5 bg-white/90 py-3 pl-11 pr-4 text-sm text-slate-900 shadow-[0_6px_16px_rgba(31,23,32,0.04)] outline-none transition placeholder:text-gray-400 focus:border-(--color-soft) focus:bg-white"
                  />
                </label>
                <div className="flex flex-wrap gap-2">
                  <FilterButton active={statusFilter === "all"} onClick={() => setStatusFilter("all")}>Toți</FilterButton>
                  <FilterButton active={statusFilter === "Active"} onClick={() => setStatusFilter("Active")}>Activi</FilterButton>
                  <FilterButton active={statusFilter === "Paused"} onClick={() => setStatusFilter("Paused")}>Pauzați</FilterButton>
                  <FilterButton active={statusFilter === "Invited"} onClick={() => setStatusFilter("Invited")}>Invitați</FilterButton>
                </div>
              </div>
            </div>
            <div className="px-5 pb-5 sm:px-7 sm:pb-7">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <LoadingCard />
                <LoadingCard />
                <LoadingCard />
              </div>
            </div>
          </section>
        ) : error ? (
          <div className="rounded-[28px] sm:rounded-4xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 shadow-sm">{error}</div>
        ) : (
          <section
            className="rounded-[28px] sm:rounded-4xl border border-black/5 shadow-sm overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, #ffffff 0%, rgba(239,208,202,0.18) 60%, rgba(125,128,218,0.08) 100%)",
            }}
          >
            <div className="p-5 sm:p-7">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-slate-900">Lista de clienți</h2>
                <p className="mt-1 text-sm text-[#6B5A63]">
                  {filtered.length} rezultate afișate
                </p>
              </div>
              <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <label className="relative block w-full lg:max-w-md">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <SearchIcon />
                  </span>
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Caută după nume, email sau id"
                    className="w-full rounded-2xl border border-black/5 bg-white/90 py-3 pl-11 pr-11 text-sm text-slate-900 shadow-[0_6px_16px_rgba(31,23,32,0.04)] outline-none transition placeholder:text-gray-400 focus:border-(--color-soft) focus:bg-white"
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
                <div className="flex flex-wrap gap-2">
                  <FilterButton active={statusFilter === "all"} onClick={() => setStatusFilter("all")}>Toți</FilterButton>
                  <FilterButton active={statusFilter === "Active"} onClick={() => setStatusFilter("Active")}>Activi</FilterButton>
                  <FilterButton active={statusFilter === "Paused"} onClick={() => setStatusFilter("Paused")}>Pauzați</FilterButton>
                  <FilterButton active={statusFilter === "Invited"} onClick={() => setStatusFilter("Invited")}>Invitați</FilterButton>
                </div>
              </div>
            </div>
            <div className="px-5 pb-5 sm:px-7 sm:pb-7">
              {clients.length === 0 ? (
                <div className="rounded-[28px] sm:rounded-4xl border border-dashed border-black/10 bg-white/85 p-10 text-center shadow-[0_6px_16px_rgba(31,23,32,0.04)]">
                  <h3 className="text-sm font-semibold text-gray-900">Încă nu ai clienți</h3>
                  <p className="mt-2 text-sm text-[#6B5A63]">
                    Start prin a adăuga primul client
                  </p>
                  <button
                    type="button"
                    onClick={onOpenAdd}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-(--color-accent) px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
                  >
                    <PlusIcon />
                    Adaugă client
                  </button>
                </div>
              ) : filtered.length === 0 ? (
                <div className="rounded-[28px] sm:rounded-4xl border border-dashed border-black/10 bg-white/85 p-10 text-center shadow-[0_6px_16px_rgba(31,23,32,0.04)]">
                  <h3 className="text-sm font-semibold text-gray-900">Nu există clienți potriviți</h3>
                  <p className="mt-2 text-sm text-[#6B5A63]">
                    Încearcă altă căutare sau resetează filtrele.
                  </p>
                  <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      className="inline-flex items-center justify-center rounded-xl border border-black/5 bg-(--color-card) px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-(--color-soft)"
                    >
                      Șterge căutarea
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusFilter("all")}
                      className="inline-flex items-center justify-center rounded-xl border border-black/5 bg-(--color-card) px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-(--color-soft)"
                    >
                      Resetează filtrele
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {filtered.map((client) => (
                    <ClientRowCard
                      key={client.id}
                      therapistId={therapistId}
                      client={client}
                      onToggleStatus={() => onToggleStatus(client.id)}
                      onRemove={() => onRemove(client.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      {open ? (
        <div
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onMouseDown={() => setOpen(false)}
        >
          <div
            className="mx-auto mt-24 w-[92%] max-w-lg rounded-[28px] bg-white shadow-xl border border-gray-100"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Adaugă client</h3>
                <p className="mt-1 text-sm text-gray-600">Creează o nouă intrare</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl p-2 text-gray-500 hover:bg-gray-100 transition"
                aria-label="Close"
              >
                <XIcon />
              </button>
            </div>
            <div className="space-y-4 px-6 py-5">
              <label className="block">
                <span className="text-xs font-semibold text-gray-500">Email client</span>
                <input
                  value={draftEmail}
                  onChange={(e) => setDraftEmail(e.target.value)}
                  placeholder="ex: client@email.com"
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-gray-500">Nume (opțional)</span>
                <input
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  placeholder="ex: Ana M."
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </label>
              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition"
                >
                  Anulează
                </button>
                <button
                  type="button"
                  onClick={onAddClient}
                  className="inline-flex items-center justify-center rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 transition"
                >
                  Adaugă
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
