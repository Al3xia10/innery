"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/app/_lib/authClient";

type TodayResponse = {
  today: {
    date: string;
    prompt: { id: number; text: string };
    therapistId: number | null;
    checkin: {
      existsToday: boolean;
      last: {
        mood: number;
        anxiety: number;
        energy: number;
        sleepHours: number | string;
        note?: string;
      } | null;
      streak: { count: number };
    };
    nextSession: any | null;
    activeGoal: any | null;
  };
};

type MeResponse =
  | { id: number; role: string; name?: string; email?: string }
  | { user: { id: number; role: string; name?: string; email?: string } };

function getMeRole(me: MeResponse | any) {
  return me?.role ?? me?.user?.role;
}
function getMeName(me: MeResponse | any) {
  return me?.name ?? me?.user?.name ?? "client";
}
function getMeEmail(me: MeResponse | any) {
  return me?.email ?? me?.user?.email ?? "";
}


export default function ClientTodayPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<TodayResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [me, setMe] = useState<MeResponse | null>(null);

  const [mood, setMood] = useState(7);
  const [anxiety, setAnxiety] = useState(4);
  const [energy, setEnergy] = useState(6);
  const [sleepHours, setSleepHours] = useState<number>(6.5);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [checkinOpen, setCheckinOpen] = useState(false);

  const existsToday = data?.today.checkin.existsToday ?? false;
  const streak = data?.today.checkin.streak.count ?? 0;
  const lastCheckin = data?.today.checkin.last ?? null;

  useEffect(() => {
    const load = async () => {
      try {
        const meRes = await apiFetch("/api/me");
        setMe(meRes);

        const role = getMeRole(meRes);
        if (role !== "client") {
          router.replace("/");
          return;
        }

        const today = await apiFetch("/api/client/today");
        setData(today);

        // Prefill inputs with last check-in (nice UX)
        const last = today?.today?.checkin?.last;
        if (last) {
          setMood(Number(last.mood ?? 7));
          setAnxiety(Number(last.anxiety ?? 4));
          setEnergy(Number(last.energy ?? 6));
          const sh = Number(last.sleepHours ?? 6.5);
          setSleepHours(Number.isFinite(sh) ? sh : 6.5);
          setNote((last.note ?? "").toString());
        }
      } catch (e: any) {
        const msg = String(e?.message ?? "");
        const unauthorized =
          e?.status === 401 || msg.includes("401") || msg.toLowerCase().includes("unauthorized");
        if (unauthorized) {
          router.replace("/login");
          return;
        }
        setError("Nu s-a putut încărca pagina Today.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);
  

  const rawDate = data?.today.date;
  const niceDate = rawDate
    ? new Date(rawDate).toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "2-digit",
      })
    : "";

  async function saveCheckin() {
    try {
      setSaving(true);
      await apiFetch("/api/client/checkins", {
        method: "POST",
        body: JSON.stringify({
          type: "daily",
          mood,
          anxiety,
          energy,
          sleepHours,
          note,
        }),
      });

      const today = await apiFetch("/api/client/today");
      setData(today);
      setNote("");
      setSavedToast(true);
      window.setTimeout(() => setSavedToast(false), 2600);
      setCheckinOpen(false);
    } catch {
      setErrorToast("Nu am putut salva check-in-ul. Încearcă din nou.");
      window.setTimeout(() => setErrorToast(null), 2800);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-8">Se încarcă…</div>;
  if (error || !data) return <div className="p-8 text-red-600">{error ?? "Eroare"}</div>;

  const nextSessionLabel = data.today.nextSession?.startsAt
    ? new Date(data.today.nextSession.startsAt).toLocaleString()
    : "Nicio ședință programată";

  const activeGoalLabel = data.today.activeGoal?.title ?? "Niciun obiectiv activ";

  return (
    <section className="relative">
      {/* Soft canvas background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-rose-200/50 blur-3xl" />
        <div className="absolute top-40 -right-24 h-80 w-80 rounded-full bg-amber-200/40 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 h-96 w-96 rounded-full bg-indigo-200/35 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Success Toast */}
        {savedToast ? (
          <div className="fixed right-4 top-4 z-50">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 shadow-sm">
              <p className="text-sm font-semibold text-emerald-800">✔️ Mulțumesc.</p>
              <p className="text-xs text-emerald-700/80">Ai făcut loc pentru tine azi.</p>
            </div>
          </div>
        ) : null}
        {errorToast ? (
          <div className="fixed right-4 top-4 z-50">
            <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 shadow-sm">
              <p className="text-sm font-semibold text-rose-800">Ups.</p>
              <p className="text-xs text-rose-700/80">{errorToast}</p>
            </div>
          </div>
        ) : null}
        {/* HERO */}
        <header className="relative overflow-hidden rounded-[28px] border border-white/60 bg-white/70 backdrop-blur-xl shadow-sm">
          <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-linear-to-br from-rose-200/70 to-amber-200/60 blur-2xl" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-linear-to-br from-indigo-200/60 to-rose-200/40 blur-2xl" />

          <div className="relative px-6 py-7 sm:px-10 sm:py-9">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                  Spațiul tău zilnic
                </div>

                <h1 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">
                  Bună, {getMeName(me)}
                </h1>

                <p className="mt-2 text-sm text-gray-600">
                  {niceDate} 
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3">
                <Link
                  href="/client/progress"
                  className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
                >
                  Progres
                </Link>
                <Link
                  href="/client/journal"
                  className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 transition hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
                >
                  Jurnal
                </Link>
              </div>
            </div>

            {/* Mini wellbeing strip */}
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="col-span-2 sm:col-span-1 rounded-2xl border border-gray-100 bg-white/70 p-4 transition hover:-translate-y-0.5 hover:shadow-sm">
                <p className="text-xs font-semibold text-gray-500">Ritmul tău</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{streak}</p>
                <p className="mt-1 text-xs text-gray-500">zile la rând</p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white/70 p-4 flex flex-col transition hover:-translate-y-0.5 hover:shadow-sm">
                <p className="text-xs font-semibold text-gray-500">Următoarea ședință</p>
                <p className="mt-1 text-sm font-semibold text-gray-900 line-clamp-2">{nextSessionLabel}</p>
                <Link
                  href="/client/plan"
                  className="mt-auto inline-flex text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  Deschide →
                </Link>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white/70 p-4 flex flex-col transition hover:-translate-y-0.5 hover:shadow-sm">
                <p className="text-xs font-semibold text-gray-500">Obiectiv activ</p>
                <p className="mt-1 text-sm font-semibold text-gray-900 line-clamp-2">{activeGoalLabel}</p>
                <Link
                  href="/client/plan"
                  className="mt-auto inline-flex text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  Deschide →
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN */}
        <div className="mt-7 sm:mt-8 grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-12">
          {/* LEFT: CHECK-IN */}
          <div className="lg:col-span-7 space-y-6">
            <section
              id="today-focus"
              className="rounded-[28px] border border-white/60 bg-white/70 backdrop-blur-xl shadow-sm p-6 sm:p-10"
            >
              <div className="flex flex-col gap-2">
                <h2 className="text-xl font-semibold text-gray-900">
                  Cum e pentru tine chiar acum?
                </h2>
                <p className="text-sm text-gray-500">
                  Nu trebuie analizat. Doar o fotografie sinceră a momentului.
                </p>
              </div>

              <div className="mt-8 space-y-6">
                {existsToday ? (
                  <div className="rounded-3xl bg-indigo-50 border border-indigo-100 p-6">
                    <p className="text-sm font-semibold text-indigo-800">✔️ Check-in completat azi</p>
                    <p className="mt-1 text-xs text-indigo-700/80">Ai făcut loc pentru tine. Contează.</p>
                  </div>
                ) : (
                  <div className="rounded-3xl bg-amber-50 border border-amber-100 p-6">
                    <p className="text-sm font-semibold text-amber-900">Check-in-ul de azi e încă deschis</p>
                    <p className="mt-1 text-xs text-amber-900/80">
                      Dacă vrei, completează-l în ritmul tău — durează sub un minut.
                    </p>
                  </div>
                )}

                {lastCheckin ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <Metric label="Stare" value={`${lastCheckin.mood}/10`} />
                    <Metric label="Anxietate" value={`${lastCheckin.anxiety}/10`} />
                    <Metric label="Energie" value={`${lastCheckin.energy}/10`} />
                    <Metric label="Somn" value={`${Number(lastCheckin.sleepHours) || 0}h`} />
                  </div>
                ) : null}

                {lastCheckin?.note ? (
                  <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4 text-sm text-gray-700">
                    <span className="font-semibold text-gray-900">Notiță: </span>
                    {lastCheckin.note}
                  </div>
                ) : null}

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setCheckinOpen((v) => !v)}
                    className="inline-flex w-full items-center justify-center rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
                  >
                    {existsToday ? "Actualizează check-in" : "Completează check-in"}
                  </button>
                </div>
              </div>

              {checkinOpen ? (
  <div className="mt-6 rounded-3xl border border-white/60 bg-white/60 backdrop-blur-xl shadow-sm overflow-hidden">
    <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-white/60 bg-white/70">
      <div>
        <p className="text-sm font-semibold text-gray-900">
          {existsToday ? "Actualizează check-in" : "Completează check-in"}
        </p>
        <p className="mt-1 text-xs text-gray-600">O fotografie sinceră a momentului.</p>
      </div>
      <button
        type="button"
        onClick={() => setCheckinOpen(false)}
        className="shrink-0 inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
      >
        Închide
      </button>
    </div>

    <div className="px-5 py-5">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* LEFT: sliders */}
        <div className="space-y-5">
          <div className="rounded-3xl border border-white/60 bg-white/65 p-4 shadow-sm">
            <FancySlider label="Mood" value={mood} onChange={setMood} />
            <p className="mt-2 text-[11px] text-gray-500">1 = foarte jos · 10 = foarte bine</p>
          </div>

          <div className="rounded-3xl border border-white/60 bg-white/65 p-4 shadow-sm">
            <FancySlider label="Anxietate" value={anxiety} onChange={setAnxiety} />
            <p className="mt-2 text-[11px] text-gray-500">1 = calm · 10 = foarte intens</p>
          </div>

          <div className="rounded-3xl border border-white/60 bg-white/65 p-4 shadow-sm">
            <FancySlider label="Energie" value={energy} onChange={setEnergy} />
            <p className="mt-2 text-[11px] text-gray-500">1 = epuizat · 10 = plin de energie</p>
          </div>
        </div>

        {/* RIGHT: inputs */}
        <div className="space-y-5">
          <div className="rounded-3xl border border-white/60 bg-white/65 p-4 shadow-sm">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900">Somn (ore)</label>
                <input
                  type="number"
                  step="0.5"
                  min={0}
                  max={24}
                  value={sleepHours}
                  onChange={(e) => setSleepHours(Number(e.target.value))}
                  className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="mt-2 text-[11px] text-gray-500">Poți scrie 6.5, 7, 8…</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900">Ce e diferit azi?</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Un gând scurt..."
                  rows={4}
                  className="mt-2 w-full resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="mt-2 text-[11px] text-gray-500">Doar pentru tine. Poate rămâne gol.</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-indigo-100 bg-indigo-50/70 p-4">
            <p className="text-xs font-semibold text-indigo-800">Tip</p>
            <p className="mt-1 text-xs text-indigo-700/80">
              Dacă îți vine să grăbești, e ok. Revino blând la ritm.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => setCheckinOpen(false)}
          className="inline-flex w-full items-center justify-center rounded-2xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 sm:w-auto"
        >
          Renunță
        </button>

        <button
          type="button"
          disabled={saving}
          onClick={saveCheckin}
          className="inline-flex w-full items-center justify-center rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60 sm:w-auto"
        >
          {saving ? "Salvez..." : "Salvează"}
        </button>
      </div>
    </div>
  </div>
) : null}
            </section>

          </div>

          {/* RIGHT: SUPPORT PANEL */}
          <aside className="lg:col-span-5 space-y-6">
            {/* DAILY PROMPT */}
            <section
              id="prompt"
              className="rounded-[28px] border border-white/60 bg-white/70 backdrop-blur-xl p-6 sm:p-8 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Întrebarea zilei</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Dacă vrei, scrie un răspuns mic — doar pentru tine, sau de împărtășit.
                  </p>
                </div>
                <Link
                  href="/client/journal"
                  className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
                >
                  Deschide →
                </Link>
              </div>

              <div className="mt-5 rounded-3xl border border-white/60 bg-linear-to-br from-rose-50 to-indigo-50 p-6 shadow-sm">
                <p className="text-sm text-gray-900 leading-relaxed">{data.today.prompt.text}</p>
              </div>

              <div className="mt-5 flex flex-col sm:flex-row sm:flex-wrap gap-3">
                <Link
                  href="/client/journal"
                  className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 transition hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
                >
                  Scrie în jurnal
                </Link>
                
              </div>
            </section>
            {/* PROFILE */}
            <section className="rounded-[28px] border border-white/60 bg-white/70 backdrop-blur-xl p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Profil</h3>
                  <p className="mt-1 text-sm text-gray-600">Ești conectată ca</p>
                </div>
                <Link
                  href="/client/settings"
                  className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition"
                >
                  Setări →
                </Link>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <div className="h-11 w-11 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-semibold">
                  {(getMeName(me) || "C")
                    .split(" ")
                    .filter(Boolean)
                    .map((n: string) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{getMeName(me)}</p>
                  {getMeEmail(me) ? (
                    <p className="text-xs text-gray-500 truncate">{getMeEmail(me)}</p>
                  ) : null}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <MiniPill label="Azi" value={existsToday ? "Făcut" : "În așteptare"} />
                <MiniPill label="Ritmul tău" value={String(streak)} />
              </div>
            </section>

          </aside>
        </div>
      </div>
    </section>
  );
}


function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function FancySlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const id = `fancy_${label.toLowerCase().replace(/\s+/g, "_")}`;

  // subtle color indicator (no global tailwind changes)
  const intensity =
    value <= 3
      ? "bg-rose-100 text-rose-700"
      : value <= 6
      ? "bg-amber-100 text-amber-700"
      : "bg-emerald-100 text-emerald-700";

  return (
    <div className="rounded-2xl border border-gray-100 bg-white/80 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-semibold text-gray-900">
          {label}
        </label>

        <span
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${intensity}`}
        >
          <span className="h-2 w-2 rounded-full bg-current opacity-70" />
          {value}/10
        </span>
      </div>

      {/* chip scale */}
      <div className="mt-4 flex items-center justify-between gap-1">
        {[...Array(10)].map((_, i) => {
          const v = i + 1;
          const active = v <= value;
          return (
            <button
              key={v}
              type="button"
              onClick={() => onChange(v)}
              className={`h-2 flex-1 rounded-full transition ${
                active
                  ? "bg-indigo-500"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            />
          );
        })}
      </div>

      <input
        id={id}
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="sr-only"
      />
    </div>
  );
}

function MiniPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white/80 p-3">
      <p className="text-[11px] font-semibold text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}