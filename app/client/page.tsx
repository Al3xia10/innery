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
  const [repereOpen, setRepereOpen] = useState(false);

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

      <div className="mx-auto max-w-6xl px-6 lg:px-8 py-8 space-y-8">
        {/* Toasts */}
        {savedToast ? (
          <div className="fixed right-4 top-4 z-50">
            <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
  <p className="text-sm font-semibold text-gray-900">✔️ Ai făcut loc pentru tine.</p>
  <p className="text-xs text-gray-600">Chiar și un minut contează.</p>
</div>
          </div>
        ) : null}
        {errorToast ? (
          <div className="fixed right-4 top-4 z-50">
            <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
  <p className="text-sm font-semibold text-gray-900">Ups.</p>
  <p className="text-xs text-gray-600">{errorToast}</p>
</div>
          </div>
        ) : null}

        

        {/* HERO (centered, minimal, warm) */}
        <header>
          <div
  className="relative overflow-hidden rounded-3xl border border-black/5 shadow-sm p-7 sm:p-9"
  style={{
    background:
      "linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(224,231,255,0.7) 100%)",
  }}
>

            <div className="relative">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                 <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-indigo-700 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                Momentul tau
              </div>

                  <h1 className="mt-3 text-3xl sm:text-3xl font-semibold tracking-tight text-gray-900">
                    Bună, {getMeName(me)}
                  </h1>

                  <p className="mt-2 text-sm text-gray-600">{niceDate}</p>

                  <p className="mt-3 text-base text-gray-700">
                    {existsToday
                      ? "E bine că ai revenit. Azi ai făcut deja un pas pentru tine."
                      : "Poți începe de oriunde. Nu e nevoie să fie perfect."}
                  </p>
                </div>

                <div className="sm:pt-1">
                  <p className="text-xs tracking-wide text-indigo-600 font-medium">
                    Pentru tine, azi
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-gray-900/10" />
                <span className="text-[11px] font-medium text-gray-500">încet, fără grabă</span>
                <div className="h-px flex-1 bg-gray-900/10" />
              </div>

              <p className="mt-3 text-xl sm:text-xl font-semibold text-gray-900 leading-relaxed">
                “{data.today.prompt.text}”
              </p>

              <p className="mt-4 text-sm text-gray-600 leading-relaxed">
                Nu trebuie să găsești un răspuns perfect.
                Poate fi doar un gând mic sau doar un moment de reflecție.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/client/journal"
                  className="inline-flex w-full sm:w-auto items-center justify-center rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
                >
                  Scriu un rând
                </Link>

                <button
                  type="button"
                  onClick={() => setRepereOpen((v) => !v)}
                  className="inline-flex w-full sm:w-auto items-center justify-center rounded-2xl border border-gray-200 bg-white/80 px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-white transition"
                >
                  {repereOpen ? "Ascunde reperele" : "Vezi reperele de azi"}
                </button>
              </div>

              {repereOpen ? (
                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-gray-100 bg-white/80 p-4">
                    <p className="text-xs font-semibold text-gray-500">Ritmul tău</p>
                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {streak} {streak === 1 ? "zi" : "zile"} în care ai revenit
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Fără presiune. Doar un fir blând de continuitate.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-white/80 p-4">
                    <p className="text-xs font-semibold text-gray-500">
                      Următoarea întâlnire
                    </p>
                    <p className="mt-1 text-sm font-semibold text-gray-900 line-clamp-2">
                      {nextSessionLabel}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      E în regulă dacă azi nu e nimic programat.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-white/80 p-4">
                    <p className="text-xs font-semibold text-gray-500">
                      Obiectiv activ
                    </p>
                    <p className="mt-1 text-sm font-semibold text-gray-900 line-clamp-2">
                      {activeGoalLabel}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Îl poți ajusta oricând, în Plan.
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        {/* CHECK-IN (flow, no right column) */}
       <section
  className="mt-7 relative overflow-hidden rounded-3xl border border-black/5 shadow-sm p-6 sm:p-8"
  style={{
    background:
      "linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(224,231,255,0.7) 100%)",
  }}
>
         <div className="relative flex flex-col gap-2">
            <h2 className="text-xl font-semibold text-gray-900">Cum e pentru tine în acest moment?</h2>
            <p className="text-sm text-gray-600">Nu trebuie să explici nimic. Doar observă ce e aici. E suficient.</p>
          </div>

          <div className="relative mt-6 space-y-4">
            {existsToday ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <p className="text-sm font-semibold text-gray-900">✔️ Ai făcut deja check-in azi</p>
                <p className="mt-1 text-xs text-gray-600">Dacă vrei, poți reveni și ajusta. Fără presiune.</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <p className="text-sm font-semibold text-gray-900">Poți reveni la tine când simți.</p>
                <p className="mt-1 text-xs text-gray-600">
                  Dacă alegi să îl completezi, fă-o în ritmul tău. Nu e grabă.
                </p>
              </div>
            )}

            {lastCheckin ? (
              <div className="rounded-3xl border border-gray-100 bg-white/80 p-5">
                <p className="text-xs font-semibold text-gray-500">Ultima fotografie</p>
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Metric label="Stare" value={`${lastCheckin.mood}/10`} />
                  <Metric label="Anxietate" value={`${lastCheckin.anxiety}/10`} />
                  <Metric label="Energie" value={`${lastCheckin.energy}/10`} />
                  <Metric label="Somn" value={`${Number(lastCheckin.sleepHours) || 0}h`} />
                </div>

                {lastCheckin.note ? (
                  <div className="mt-4 rounded-2xl bg-gray-50 border border-gray-100 p-4 text-sm text-gray-700">
                    <span className="font-semibold text-gray-900">Notiță: </span>
                    {lastCheckin.note}
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="pt-1">
              <button
                type="button"
                onClick={() => setCheckinOpen((v) => !v)}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
              >
                {existsToday ? "Revino la momentul tău" : "Îți faci loc pentru tine"}
              </button>
              <p className="mt-2 text-xs text-gray-600 text-center">Nu trebuie să fie perfect. Doar real.</p>
            </div>
          </div>

          {checkinOpen ? (
            <div className="mt-6 rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-white/60 bg-white/80">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {existsToday ? "Revino și ajustează blând" : "O fotografie sinceră a momentului"}
                  </p>
                  <p className="mt-1 text-xs text-gray-600">Un minut, cât ai. E suficient.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setCheckinOpen(false)}
                  className="shrink-0 inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition"
                >
                  Închide
                </button>
              </div>

              <div className="px-5 py-5">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div className="space-y-5">
                    <FancySlider label="Stare" value={mood} onChange={setMood} kind="mood" />
                    <FancySlider label="Anxietate" value={anxiety} onChange={setAnxiety} kind="anxiety" />
                    <FancySlider label="Energie" value={energy} onChange={setEnergy} kind="energy" />
                    <p className="text-[11px] text-gray-500">1 = foarte jos · 10 = foarte bine (sau intens)</p>
                  </div>

                  <div className="space-y-5">
                    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
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

                    <div className="rounded-3xl border border-white/60 bg-white/80 backdrop-blur p-4">
                      <p className="text-xs font-semibold text-gray-900">Un mic reminder</p>
                      <p className="mt-1 text-xs text-gray-600">
                        Dacă simți că te grăbești, e ok. Revino blând la ritm.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={() => setCheckinOpen(false)}
                    className="inline-flex w-full items-center justify-center rounded-2xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition sm:w-auto"
                  >
                    Nu acum
                  </button>

                  <button
                    type="button"
                    disabled={saving}
                    onClick={saveCheckin}
                    className="inline-flex w-full items-center justify-center rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60 transition sm:w-auto"
                  >
                    {saving ? "Salvez..." : "Salvează"}
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </section>

        {/* Gentle next step (tiny, not a dashboard) */}
        <section className="mt-7">
          <p className="text-sm text-gray-600">
            Dacă ai nevoie de un pas mic:{" "}
            <Link href="/client/journal" className="font-semibold text-indigo-700 hover:text-indigo-800">
              scrie un rând
            </Link>
            ,{" "}
            <Link href="/client/progress" className="font-semibold text-indigo-700 hover:text-indigo-800">
              vezi ritmul tău
            </Link>{" "}
            sau{" "}
            <Link href="/client/plan" className="font-semibold text-indigo-700 hover:text-indigo-800">
              atinge planul
            </Link>
            .
          </p>
        </section>
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
  kind,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  kind: "mood" | "anxiety" | "energy";
}) {
  const id = `fancy_${label.toLowerCase().replace(/\s+/g, "_")}`;

  
 // subtle indicator (keep calm: indigo + neutrals only)
const intensity =
  value <= 3
    ? "bg-indigo-50 text-indigo-700"
    : value <= 6
    ? "bg-indigo-100 text-indigo-700"
    : "bg-indigo-200/70 text-indigo-800";

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

      <div className="mt-3 text-xs text-gray-500">
        {value <= 3
          ? kind === "anxiety"
            ? "Pare intens acum. Respirația te poate ajuta să încetinești un pic."
            : "Pare un moment mai greu. E în regulă să fie așa."
          : value <= 6
          ? "E un amestec. Poate nu e clar, și asta e ok."
          : kind === "energy"
          ? "Energie mai multă azi. Observă ce te-a sprijinit."
          : "Se simte mai ușor acum. Observă ce a ajutat."}
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