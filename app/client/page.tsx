"use client";

import { useEffect, useRef, useState } from "react";
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
function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "?";
  const second = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return (first + second).toUpperCase();
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
  const checkinSectionRef = useRef<HTMLElement | null>(null);

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
  function openCheckinSection() {
  setCheckinOpen(true);

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      checkinSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  });
}

  if (loading) return <div className="p-8">Se încarcă…</div>;
  if (error || !data) return <div className="p-8 text-red-600">{error ?? "Eroare"}</div>;

  const nextSessionLabel = data.today.nextSession?.startsAt
    ? new Date(data.today.nextSession.startsAt).toLocaleString()
    : "Nicio ședință programată";

  const activeGoalLabel = data.today.activeGoal?.title ?? "Niciun obiectiv activ";

    return (
    <section className="min-h-screen bg-background">
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

      <div className="w-full px-4 pb-16 pt-6 sm:px-6 lg:px-10 lg:pt-10">
        <div className="space-y-6 lg:mx-auto lg:max-w-5xl lg:space-y-8">
          <header className="space-y-6">
            <div className="px-4 sm:px-5 lg:px-7">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#e7edf8_0%,#f2e8ff_100%)] text-sm font-semibold text-slate-700 shadow-sm">
                    {initialsFromName(getMeName(me))}
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b17d72]">
                      welcome back
                    </p>
                    <h1 className="mt-1 text-[1.5rem] font-semibold leading-none tracking-tight text-slate-900 sm:text-[1.7rem]">
                      {getMeName(me)}
                    </h1>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-5 px-4 sm:px-5 lg:px-7">
              <div className="space-y-3">
                <p className="text-[1.9rem] font-semibold leading-tight tracking-tight text-slate-900 sm:text-[1.8rem]">
                  Cum esti astazi?
                </p>
                <p className="text-sm leading-6 text-[#8f7e86]">{niceDate}</p>
              </div>
              

             <div className="w-full rounded-[36px] bg-[linear-gradient(135deg,var(--color-warm)_0%,var(--color-accent)_50%,var(--color-primary)_100%)] p-6 text-white shadow-[0_28px_60px_rgba(184,104,152,0.24)] sm:p-7">
                <div className="inline-flex rounded-full bg-white/45 px-3 py-1 text-xs font-semibold text-white">
                  Daily mood check
                </div>

                <h2 className="mt-4 text-[1.8rem] font-semibold tracking-tight text-white sm:text-[2rem]">
                    Cum te simți azi?
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-white/85">
                    Alege repede o stare și începe blând de aici.
                  </p>

                <div className="mt-5 grid grid-cols-5 gap-2 lg:gap-3">
                <MoodFaceButton label="foarte bine" icon="😊" active={mood >= 9} onClick={() => { setMood(9); openCheckinSection(); }} />
                <MoodFaceButton label="bine" icon="🙂" active={mood >= 7 && mood < 9} onClick={() => { setMood(7); openCheckinSection(); }} />
                <MoodFaceButton label="neutru" icon="😐" active={mood >= 5 && mood < 7} onClick={() => { setMood(5); openCheckinSection(); }} />
                <MoodFaceButton label="jos" icon="🙁" active={mood >= 3 && mood < 5} onClick={() => { setMood(3); openCheckinSection(); }} />
                <MoodFaceButton label="foarte greu" icon="😣" active={mood < 3} onClick={() => { setMood(1); openCheckinSection(); }} />
                </div>

                <button
                  type="button"
                  onClick={openCheckinSection}
                  className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-white px-5 py-3.5 text-sm font-semibold text-[#9a5d77] shadow-[0_14px_28px_rgba(255,255,255,0.22)] transition hover:opacity-95">
                  {existsToday ? "Revino la check-in" : "Începe check-in-ul"}
                </button>
              </div>
            </div>
          </header>

          <div className="px-4 sm:px-5 lg:px-7">
          <div className="space-y-8">
             <section className="bg-transparent p-0 shadow-none">
                <div className="flex items-center justify-between gap-3 rounded-4xl bg-white border border-black/15 px-5 py-5  shadow-[0_16px_32px_rgba(31,23,32,0.08)] sm:px-6">
                  <div>
                    <p className="text-lg font-semibold tracking-tight text-foreground">Scrie o notiță nouă în jurnal</p>
                    <p className="mt-1 text-sm text-foreground/85">Un rând mic e suficient.</p>
                  </div>
                  <Link
                    href="/client/journal"
                    className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#fff6fb] text-2xl font-medium text-[#9a5d77] shadow-[0_10px_24px_rgba(180,112,140,0.18)] transition hover:bg-white"
                    aria-label="Deschide jurnalul"
                    title="Deschide jurnalul"
                  >
                    +
                  </Link>
                </div>
              </section>

              <section className="bg-transparent p-0 shadow-none">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xl font-semibold tracking-tight text-slate-900">Spațiul tău de azi</p>
                    <p className="mt-1 text-sm text-slate-500">Mic, clar și ușor de parcurs.</p>
                  </div>
                </div>

                                <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <SoftFeatureCard
                    badge="plan"
                    title="Planul tău"
                    description="Vezi obiectivul tău activ sau creează unul nou, în ritmul tău."
                    tone="warm"
                    href="/client/plan"
                    actionLabel="Deschide planul"
                  />

                  <SoftFeatureCard
                    badge="recomandare"
                    title={
                      lastCheckin
                        ? lastCheckin.mood <= 4
                          ? "Ai nevoie de puțin spațiu"
                          : "Continuă ritmul blând"
                        : "Un început mic contează"
                    }
                    description={
                      lastCheckin
                        ? lastCheckin.mood <= 4
                          ? "Poate te-ar ajuta un exercițiu scurt de respirație sau o pauză conștientă."
                          : "Se vede un echilibru. Continuă cu pași mici."
                        : "Începe cu un check-in sau un gând scurt în jurnal."
                    }
                    tone="purple"
                    href="/client/journal"
                    actionLabel="Deschide jurnalul"
                  />
                </div>
              </section>

              {checkinOpen ? (
                <section
                  ref={checkinSectionRef}
                  className="overflow-hidden rounded-4xl bg-white shadow-[0_20px_44px_rgba(171,122,150,0.16)] ring-1 ring-[#f3d7df]"
                >
                  <div className="flex items-start justify-between gap-4 border-b border-[#f5e3ea] bg-[linear-gradient(135deg,#fff4ef_0%,#fdf3ff_100%)] px-5 py-4 sm:px-6">
                    <div>
                      <p className="text-base font-semibold text-slate-900">
                        {existsToday ? "Revino și ajustează blând" : "O fotografie sinceră a momentului"}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">Un minut, cât ai. E suficient.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCheckinOpen(false)}
                     className="inline-flex rounded-xl border border-white/80 bg-white px-3 py-2 text-sm font-semibold text-[#8c6072] shadow-sm transition hover:bg-white"
                    >
                      Închide
                    </button>
                  </div>

                  <div className="px-5 py-5 sm:px-6 sm:py-6">
                    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
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

                        <div className="rounded-3xl border border-[#f7dbe8] bg-[linear-gradient(135deg,#fff5ef_0%,#fff7fb_100%)] p-4">
                          <p className="text-xs font-semibold text-gray-900">Un mic reminder</p>
                          <p className="mt-1 text-xs text-gray-600">Dacă simți că te grăbești, e ok. Revino blând la ritm.</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <button
                        type="button"
                        onClick={() => setCheckinOpen(false)}
                        className="inline-flex w-full items-center justify-center rounded-2xl border border-[#eed6e0] bg-white px-6 py-3 text-sm font-semibold text-[#7f6470] shadow-sm transition hover:bg-[#fffafb] sm:w-auto"
                      >
                        Nu acum
                      </button>

                      <button
                        type="button"
                        disabled={saving}
                        onClick={saveCheckin}
                        className="inline-flex w-full items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--color-warm)_0%,var(--color-accent)_50%,var(--color-primary)_100%)] px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(184,104,152,0.24)] transition hover:opacity-95 disabled:opacity-60 sm:w-auto">
                        {saving ? "Salvez..." : "Salvează"}
                      </button>
                    </div>
                  </div>
                </section>
              ) : null}
            </div>

             <section className="mt-10 rounded-[28px] bg-[linear-gradient(180deg,var(--color-card)_0%,var(--background)_100%)] p-6 shadow-[0_16px_36px_rgba(186,137,159,0.10)] ring-1 ring-(--color-soft)">
                <div>
                  <p className="text-lg font-semibold tracking-tight text-slate-900">Ultimul tău check-in</p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    O fotografie scurtă a ultimei reveniri.
                  </p>
                </div>

                {lastCheckin ? (
                  <>
                    <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                      <Metric label="Stare" value={`${lastCheckin.mood}/10`} />
                      <Metric label="Anxietate" value={`${lastCheckin.anxiety}/10`} />
                      <Metric label="Energie" value={`${lastCheckin.energy}/10`} />
                      <Metric label="Somn" value={`${Number(lastCheckin.sleepHours) || 0}h`} />
                    </div>

                    {lastCheckin.note ? (
                      <div className="mt-6 rounded-3xl border border-[#ecd7e1] bg-[linear-gradient(180deg,#fffdfd_0%,#fff6fa_100%)] p-5 text-sm text-gray-700 shadow-sm">
                        <span className="font-semibold text-gray-900">Notiță: </span>
                        {lastCheckin.note}
                      </div>
                    ) : null}
                  </>
                ) : (
                  <div className="mt-4 rounded-3xl border border-dashed border-[#e9ced9] bg-white/80 p-4 text-sm text-slate-500">
                    Încă nu ai un check-in salvat. Poți începe chiar de sus.
                  </div>
                )}
              </section>
        </div>
        </div>
      </div>
    </section>
  );
}


function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-(--color-soft) bg-[linear-gradient(180deg,var(--color-card)_0%,var(--background)_100%)] p-5 shadow-[0_10px_22px_rgba(31,23,32,0.06)]">
      <p className="text-xs font-medium text-[#8f7e86]">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}
function MoodFaceButton({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={
        "flex h-12 w-full items-center justify-center rounded-full border text-xl shadow-sm transition sm:h-14 " +
        (active
          ? "border-(--color-soft) bg-[linear-gradient(135deg,var(--color-warm)_0%,var(--background)_100%)] ring-2 ring-(--color-soft)"
          : "border-white/70 bg-white/80 backdrop-blur hover:bg-[#fffafb]")
      }
       >
      <span aria-hidden="true">{icon}</span>
    </button>
  );
}

function SoftFeatureCard({
  badge,
  title,
  description,
  tone,
  actionLabel,
  href,
  onClick,
}: {
  badge: string;
  title: string;
  description: string;
  tone: "warm" | "purple";
  actionLabel: string;
  href?: string;
  onClick?: () => void;
}) {
  const toneClass =
  tone === "warm"
    ? "bg-[linear-gradient(135deg,var(--color-warm)_0%,#f7dfd8_100%)]"
    : "bg-[linear-gradient(135deg,var(--color-soft)_0%,#f4effa_100%)]";

  const content = (
    <>
            <div className={`flex min-h-55 w-full flex-col rounded-[28px] p-5 shadow-[0_16px_28px_rgba(31,23,32,0.08)] ${toneClass}`}>
        <div className="inline-flex rounded-full bg-white/60 px-3 py-1 text-xs font-semibold text-slate-600">
          {badge}
        </div>
        <h3 className="mt-5 text-[1.45rem] font-semibold leading-[1.08] tracking-tight text-slate-900 lg:text-[1.65rem]">{title}</h3>
        <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
        <div className="mt-auto" />
      </div>
      <div className="mt-3 flex items-center justify-between rounded-[20px] bg-white px-4 py-3 shadow-[0_8px_18px_rgba(31,23,32,0.08)]">
        <span className="text-sm font-semibold text-slate-900">{actionLabel}</span>
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#fff6fb] text-lg text-[#9c5d77] shadow-sm">+</span>
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className="block w-full text-left">
      {content}
    </button>
  );
}

function MiniInsightCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-[20px] bg-[linear-gradient(180deg,#ffffff_0%,#fff7fb_100%)] p-4 shadow-[0_10px_20px_rgba(189,133,158,0.10)]">
     <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#c19488]">{label}</p>
      <p className="mt-2 text-sm font-semibold leading-6 text-slate-900">{value}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">{helper}</p>
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
    ? "bg-[#ffe8ef] text-[#b85f86]"
    : value <= 6
    ? "bg-[#f8ddff] text-[#9157b3]"
    : "bg-[#ffe3d6] text-[#b96a49]";

  return (
    <div className="rounded-3xl border border-[#f4dfe6] bg-[linear-gradient(180deg,#ffffff_0%,#fff8fb_100%)] p-5 shadow-[0_12px_26px_rgba(31,23,32,0.08)]">
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
                  ? "bg-[linear-gradient(90deg,var(--color-warm)_0%,var(--color-accent)_55%,var(--color-primary)_100%)]"
                  : "bg-[#ecdfe5] hover:bg-[#e4d0d8]"
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