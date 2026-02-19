"use client";

import * as React from "react";
import Link from "next/link";

type GoalStatus = "Activ" | "În pauză" | "Încheiat";

type Goal = {
  id: string;
  title: string;
  subtitle?: string;
  status: GoalStatus;
  progress?: number; // 0..100
  updatedAt: string;
};

type Exercise = {
  id: string;
  title: string;
  kind: "Exercițiu" | "Experiment" | "Rutină";
  minutes?: number;
  note?: string;
};

type Resource = {
  id: string;
  title: string;
  type: "PDF" | "Link" | "Audio" | "Fișă";
  description?: string;
  href?: string;
  addedAt: string;
};

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function toNiceDate(raw: string) {
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "2-digit" });
}

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

export default function PlanPage() {
  // Demo data (safe, no backend). Replace later with API calls.
  const [goals, setGoals] = React.useState<Goal[]>([
    {
      id: "g1",
      title: "Somn mai stabil",
      subtitle: "Rutina de seară • 10 minute",
      status: "Activ",
      progress: 35,
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    },
    {
      id: "g2",
      title: "Mai multă blândețe cu mine",
      subtitle: "Observ + rescriu critică",
      status: "În pauză",
      progress: 20,
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    },
  ]);

  const [exercises, setExercises] = React.useState<Exercise[]>([
    {
      id: "e1",
      title: "Respirație 4–2–6 (1 minut)",
      kind: "Rutină",
      minutes: 1,
      note: "Când simți că se strânge pieptul, doar începe. Nu perfecțiune.",
    },
    {
      id: "e2",
      title: "Jurnal: 3 rânduri seara",
      kind: "Exercițiu",
      minutes: 5,
      note: "1) Ce a fost greu 2) Ce a fost ok 3) Un pas mic pentru mâine",
    },
  ]);

  const [resources, setResources] = React.useState<Resource[]>([
    {
      id: "r1",
      title: "Fișă: gânduri automate",
      type: "Fișă",
      description: "Un template simplu pentru observare → reinterpretare.",
      href: "#",
      addedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    },
    {
      id: "r2",
      title: "Audio: scanare corporală (8 min)",
      type: "Audio",
      description: "Pentru seri agitate.",
      href: "#",
      addedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    },
  ]);

  const activeGoals = goals.filter((g) => g.status === "Activ");
  const pausedGoals = goals.filter((g) => g.status === "În pauză");
  const doneGoals = goals.filter((g) => g.status === "Încheiat");

  const progressSummary = React.useMemo(() => {
    const p = activeGoals
      .map((g) => (typeof g.progress === "number" ? g.progress : 0))
      .reduce((a, b) => a + b, 0);
    const avg = activeGoals.length ? Math.round(p / activeGoals.length) : 0;
    return avg;
  }, [activeGoals]);

  // Tiny UX: quick add (demo)
  function addGoal() {
    const next: Goal = {
      id: uid("g"),
      title: "Obiectiv nou",
      subtitle: "Scrie o propoziție simplă",
      status: "Activ",
      progress: 0,
      updatedAt: new Date().toISOString(),
    };
    setGoals((prev) => [next, ...prev]);
  }

  function addExercise() {
    const next: Exercise = {
      id: uid("e"),
      title: "Exercițiu nou",
      kind: "Exercițiu",
      minutes: 5,
      note: "Completează când ești gata.",
    };
    setExercises((prev) => [next, ...prev]);
  }

  function addResource() {
    const next: Resource = {
      id: uid("r"),
      title: "Resursă nouă",
      type: "Link",
      description: "Adaugă un link sau o fișă de lucru.",
      href: "#",
      addedAt: new Date().toISOString(),
    };
    setResources((prev) => [next, ...prev]);
  }

  return (
    <section className="mx-auto max-w-6xl space-y-8">
      {/* HEADER */}
      <header className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/60 px-3 py-1 text-xs font-semibold text-gray-800 shadow-sm">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(99,102,241,0.9), rgba(236,72,153,0.65))",
                }}
              />
              Planul tău
            </div>

            <h1 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">
              Plan
            </h1>
            <p className="mt-1 text-sm text-gray-600 max-w-2xl">
              Obiective, exerciții și resurse — ca să nu cari singur totul între ședințe.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={addGoal}
              className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition"
            >
              Adaugă obiectiv
            </button>

            <Link
              href="/client/journal"
              className="inline-flex items-center justify-center rounded-xl border border-white/60 bg-white/70 px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition"
            >
              Deschide jurnalul
            </Link>
          </div>
        </div>

        {/* “poetic” strip */}
        <div
          className="rounded-3xl border border-white/60 bg-white/60 p-4 sm:p-5 shadow-sm"
          style={{
            background:
              "linear-gradient(135deg, rgba(99,102,241,0.10), rgba(236,72,153,0.08), rgba(255,255,255,0.55))",
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">Ritual mic, efect mare</p>
              <p className="mt-1 text-sm text-gray-600">
                Alege <span className="font-semibold text-gray-800">un pas mic</span> azi, nu zece pași perfecți.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <MiniStat label="Obiective active" value={String(activeGoals.length)} />
              <MiniStat label="Exerciții" value={String(exercises.length)} />
              <MiniStat label="Progres" value={`${progressSummary}%`} />
            </div>
          </div>
        </div>
      </header>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT (2 cols) */}
        <div className="lg:col-span-2 space-y-8">
          {/* GOALS */}
          <Card>
            <CardHeader
              title="Obiective"
              subtitle="Ce construiești în perioada asta."
              right={
                <button
                  type="button"
                  onClick={addGoal}
                  className="text-sm font-semibold text-indigo-700 hover:text-indigo-800 transition"
                >
                  Adaugă
                </button>
              }
            />

            {goals.length === 0 ? (
              <EmptyState
                title="Încă nu ai obiective"
                subtitle="Un obiectiv bun e scurt, uman și realist."
                cta="Adaugă primul obiectiv"
                onClick={addGoal}
              />
            ) : (
              <div className="mt-5 space-y-3">
                {activeGoals.map((g) => (
                  <GoalRow key={g.id} goal={g} tone="active" />
                ))}

                {pausedGoals.length ? (
                  <div className="pt-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      În pauză
                    </p>
                    <div className="mt-2 space-y-3">
                      {pausedGoals.map((g) => (
                        <GoalRow key={g.id} goal={g} tone="paused" />
                      ))}
                    </div>
                  </div>
                ) : null}

                {doneGoals.length ? (
                  <div className="pt-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Încheiate
                    </p>
                    <div className="mt-2 space-y-3">
                      {doneGoals.map((g) => (
                        <GoalRow key={g.id} goal={g} tone="done" />
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </Card>

          {/* EXERCISES */}
          <Card>
            <CardHeader
              title="Exerciții & experimente"
              subtitle="Pași mici între ședințe (îți dau claritate)."
              right={
                <button
                  type="button"
                  onClick={addExercise}
                  className="text-sm font-semibold text-indigo-700 hover:text-indigo-800 transition"
                >
                  Adaugă
                </button>
              }
            />

            {exercises.length === 0 ? (
              <EmptyState
                title="Încă nu ai exerciții"
                subtitle="Poate fi un minut. Chiar și atât contează."
                cta="Adaugă un exercițiu"
                onClick={addExercise}
              />
            ) : (
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {exercises.map((e) => (
                  <ExerciseCard key={e.id} ex={e} />
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          {/* RESOURCES */}
          <Card>
            <CardHeader
              title="Resurse"
              subtitle="Fișe, audio, linkuri — tot într-un loc."
              right={
                <button
                  type="button"
                  onClick={addResource}
                  className="text-sm font-semibold text-indigo-700 hover:text-indigo-800 transition"
                >
                  Adaugă
                </button>
              }
            />

            {resources.length === 0 ? (
              <EmptyState
                title="Încă nu ai resurse"
                subtitle="Terapeutul poate trimite aici materiale."
                cta="Adaugă o resursă"
                onClick={addResource}
              />
            ) : (
              <div className="mt-5 space-y-3">
                {resources.map((r) => (
                  <ResourceRow key={r.id} res={r} />
                ))}
              </div>
            )}
          </Card>

          {/* NEXT STEPS */}
          <div
            className="rounded-[28px] border border-white/60 bg-white/60 p-5 shadow-sm"
            style={{
              background:
                "radial-gradient(circle at 20% 10%, rgba(99,102,241,0.18), rgba(236,72,153,0.10), rgba(255,255,255,0.65))",
            }}
          >
            <p className="text-sm font-semibold text-gray-900">Pasul de azi</p>
            <p className="mt-1 text-sm text-gray-700/90 leading-relaxed">
              Dacă totul pare mult, alege <span className="font-semibold">un singur lucru</span>:
              1 minut respirație, 3 rânduri în jurnal, sau un exercițiu mic din listă.
            </p>

            <div className="mt-4 flex flex-col gap-3">
              <Link
                href="/client/today"
                className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition"
              >
                Mergi la Today
              </Link>

              <Link
                href="/client/progress"
                className="inline-flex items-center justify-center rounded-xl border border-white/60 bg-white/70 px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition"
              >
                Vezi progresul
              </Link>
            </div>
          </div>

          {/* NOTE */}
          <div className="rounded-[28px] border border-white/60 bg-white/60 p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-900">Notă</p>
            <p className="mt-1 text-sm text-gray-600 leading-relaxed">
              Momentan pagina folosește date demo. Când legăm backend-ul, aici vei vedea obiectivele și resursele
              trimise de terapeut, plus istoricul tău.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[28px] border border-white/60 bg-white/70 backdrop-blur-xl p-5 sm:p-6 shadow-sm">
      {children}
    </div>
  );
}

function CardHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-base font-semibold text-gray-900">{title}</p>
        <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/70 px-3 py-2 shadow-sm">
      <p className="text-[11px] text-gray-600">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-gray-900 tabular-nums">{value}</p>
    </div>
  );
}

function EmptyState({
  title,
  subtitle,
  cta,
  onClick,
}: {
  title: string;
  subtitle: string;
  cta: string;
  onClick: () => void;
}) {
  return (
    <div className="mt-5 rounded-3xl border border-dashed border-gray-200 bg-white/60 p-8 text-center">
      <p className="text-sm font-semibold text-gray-900">{title}</p>
      <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
      <button
        type="button"
        onClick={onClick}
        className="mt-4 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition"
      >
        {cta}
      </button>
    </div>
  );
}

function GoalRow({ goal, tone }: { goal: Goal; tone: "active" | "paused" | "done" }) {
  const progress = typeof goal.progress === "number" ? goal.progress : 0;

  const accent =
    tone === "active"
      ? "from-indigo-500/60 to-pink-500/40"
      : tone === "paused"
      ? "from-gray-400/50 to-gray-200/30"
      : "from-emerald-500/45 to-emerald-200/20";

  const badge =
    goal.status === "Activ"
      ? "bg-indigo-50 text-indigo-800 ring-1 ring-indigo-100"
      : goal.status === "În pauză"
      ? "bg-gray-100 text-gray-800 ring-1 ring-gray-200"
      : "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/70 p-4 shadow-sm">
      {/* subtle signature stripe */}
      <div
        className={cn("absolute left-0 top-0 h-full w-1.5 bg-linear-to-b", accent)}
        aria-hidden="true"
      />

      <div className="pl-2.5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{goal.title}</p>
          {goal.subtitle ? (
            <p className="mt-0.5 text-sm text-gray-600 truncate">{goal.subtitle}</p>
          ) : null}
          <p className="mt-2 text-xs text-gray-500">
            Actualizat {toNiceDate(goal.updatedAt)}
          </p>
        </div>

        <div className="shrink-0 flex flex-col items-end gap-2">
          <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", badge)}>
            {goal.status}
          </span>

          <div className="w-28">
            <div className="h-2 rounded-full bg-white/60 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(100, Math.max(0, progress))}%`,
                  background:
                    tone === "done"
                      ? "linear-gradient(90deg, rgba(16,185,129,0.65), rgba(16,185,129,0.25))"
                      : "linear-gradient(90deg, rgba(99,102,241,0.70), rgba(236,72,153,0.35))",
                }}
              />
            </div>
            <p className="mt-1 text-[11px] text-gray-500 text-right tabular-nums">{progress}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExerciseCard({ ex }: { ex: Exercise }) {
  const chip =
    ex.kind === "Rutină"
      ? "bg-indigo-50 text-indigo-800 ring-1 ring-indigo-100"
      : ex.kind === "Experiment"
      ? "bg-pink-50 text-pink-800 ring-1 ring-pink-100"
      : "bg-gray-100 text-gray-800 ring-1 ring-gray-200";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/70 p-4 shadow-sm">
      <div
        className="absolute inset-x-0 top-0 h-0.5"
        style={{
          background:
            "linear-gradient(90deg, rgba(99,102,241,0.55), rgba(236,72,153,0.30), rgba(255,255,255,0))",
        }}
        aria-hidden="true"
      />

      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-gray-900 min-w-0 truncate">{ex.title}</p>
        <span className={cn("shrink-0 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", chip)}>
          {ex.kind}
        </span>
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
        <span>{typeof ex.minutes === "number" ? `${ex.minutes} min` : "—"}</span>
        <span>între ședințe</span>
      </div>

      {ex.note ? (
        <p className="mt-3 text-sm text-gray-700 leading-relaxed">{ex.note}</p>
      ) : null}

      <button
        type="button"
        className="mt-4 inline-flex items-center justify-center rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition w-full"
      >
        Marchează ca făcut (demo)
      </button>
    </div>
  );
}

function ResourceRow({ res }: { res: Resource }) {
  const chip =
    res.type === "PDF"
      ? "bg-gray-100 text-gray-800 ring-1 ring-gray-200"
      : res.type === "Audio"
      ? "bg-indigo-50 text-indigo-800 ring-1 ring-indigo-100"
      : res.type === "Fișă"
      ? "bg-pink-50 text-pink-800 ring-1 ring-pink-100"
      : "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100";

  return (
    <div className="rounded-2xl border border-white/60 bg-white/70 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{res.title}</p>
          {res.description ? (
            <p className="mt-0.5 text-sm text-gray-600 leading-relaxed">{res.description}</p>
          ) : null}
          <p className="mt-2 text-xs text-gray-500">Adăugat {toNiceDate(res.addedAt)}</p>
        </div>

        <div className="shrink-0 flex flex-col items-end gap-2">
          <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", chip)}>
            {res.type}
          </span>

          {res.href ? (
            <a
              href={res.href}
              className="text-sm font-semibold text-indigo-700 hover:text-indigo-800 transition"
            >
              Deschide →
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}