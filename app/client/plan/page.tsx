"use client";

import * as React from "react";
import Link from "next/link";

import PlanHeader from "./components/PlanHeader";
import GoalsSection from "./components/GoalsSection";
import GoalModal from "./components/GoalModal";
import ExercisesSection from "./components/ExercisesSection";
import ResourcesSection from "./components/ResourcesSection";

import type { Goal, Exercise, Resource, GoalStatus } from "./lib/goalTypes";
import { uid, apiStatusToUi, mapApiGoalToGoal, pickUpdatedAt } from "./lib/goalTypes";
import { fetchPlan, fetchGoalsList, createGoal, updateGoal, deleteGoal as apiDeleteGoal } from "./lib/goalApi";

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[28px] border border-white/60 bg-white/70 backdrop-blur-xl p-5 sm:p-6 shadow-sm">
      {children}
    </div>
  );
}

export default function PlanPage() {
  const [goals, setGoals] = React.useState<Goal[]>([]);
  const [exercises, setExercises] = React.useState<Exercise[]>([]);
  const [resources, setResources] = React.useState<Resource[]>([]);

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [addingGoal, setAddingGoal] = React.useState(false);
  const [goalsListSupported, setGoalsListSupported] = React.useState<boolean | null>(null);

  const [goalModalOpen, setGoalModalOpen] = React.useState(false);
  const [goalDraftTitle, setGoalDraftTitle] = React.useState<string>("");
  const [goalDraftProgress, setGoalDraftProgress] = React.useState<number>(0);
  const [goalDraftStatus, setGoalDraftStatus] = React.useState<GoalStatus>("Activ");
  const [editingGoalId, setEditingGoalId] = React.useState<string | null>(null);

  const closeGoalModal = React.useCallback(() => {
    setGoalModalOpen(false);
    setEditingGoalId(null);
    setGoalDraftTitle("");
    setGoalDraftProgress(0);
    setGoalDraftStatus("Activ");
  }, []);

  const loadPlan = React.useCallback(async () => {
    const [data, listGoalsResult] = await Promise.all([fetchPlan(), fetchGoalsList()]);

    setGoalsListSupported(listGoalsResult.supported);

    const listGoals = listGoalsResult.items;
    const plan = (data as any)?.plan ?? (data as any)?.plan ?? null;

    const fromPlan: any[] = Array.isArray((plan as any)?.goals)
      ? (plan as any).goals
      : (plan as any)?.activeGoal
      ? [(plan as any).activeGoal]
      : Array.isArray((data as any)?.goals)
      ? (data as any).goals
      : [];

    const goalsSource: any[] = listGoals.length ? listGoals : fromPlan;

    const mappedNextGoals: Goal[] = goalsSource
      .map((g: any) => mapApiGoalToGoal(g))
      .filter((g, idx, arr) => arr.findIndex((x) => x.id === g.id) === idx)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    if (!listGoals.length && mappedNextGoals.length <= 1) {
      setGoals((prev) => {
        if (!prev.length) return mappedNextGoals;
        if (!mappedNextGoals.length) return prev;
        const one = mappedNextGoals[0];
        const without = prev.filter((g) => g.id !== one.id);
        const merged = [one, ...without]
          .filter((g, idx, arr) => arr.findIndex((x) => x.id === g.id) === idx)
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        return merged;
      });
    } else {
      setGoals(mappedNextGoals);
    }

    const nextExercises: Exercise[] = Array.isArray((plan as any)?.exercises)
      ? (plan as any).exercises.map((e: any) => ({
          id: String(e?.id ?? uid("e")),
          title: String(e?.title ?? "Exercițiu"),
          kind:
            e?.kind === "Experiment" || e?.kind === "Rutină" || e?.kind === "Exercițiu"
              ? e.kind
              : "Exercițiu",
          minutes: typeof e?.minutes === "number" ? e.minutes : undefined,
          note: typeof e?.note === "string" ? e.note : undefined,
        }))
      : Array.isArray((data as any)?.exercises)
      ? (data as any).exercises.map((e: any) => ({
          id: String(e?.id ?? uid("e")),
          title: String(e?.title ?? "Exercițiu"),
          kind:
            e?.kind === "Experiment" || e?.kind === "Rutină" || e?.kind === "Exercițiu"
              ? e.kind
              : "Exercițiu",
          minutes: typeof e?.minutes === "number" ? e.minutes : undefined,
          note: typeof e?.note === "string" ? e.note : undefined,
        }))
      : [];

    const nextResources: Resource[] = Array.isArray((plan as any)?.resources)
      ? (plan as any).resources.map((r: any) => {
          const added =
            (typeof r?.addedAt === "string" && r.addedAt) ||
            (typeof r?.added_at === "string" && r.added_at) ||
            (typeof r?.createdAt === "string" && r.createdAt) ||
            (typeof r?.created_at === "string" && r.created_at) ||
            new Date().toISOString();

          const type: Resource["type"] =
            r?.type === "PDF" || r?.type === "Link" || r?.type === "Audio" || r?.type === "Fișă"
              ? r.type
              : "Link";

          return {
            id: String(r?.id ?? uid("r")),
            title: String(r?.title ?? "Resursă"),
            type,
            description: typeof r?.description === "string" ? r.description : undefined,
            href: typeof r?.href === "string" ? r.href : undefined,
            addedAt: added,
          };
        })
      : Array.isArray((data as any)?.resources)
      ? (data as any).resources.map((r: any) => {
          const added =
            (typeof r?.addedAt === "string" && r.addedAt) ||
            (typeof r?.added_at === "string" && r.added_at) ||
            (typeof r?.createdAt === "string" && r.createdAt) ||
            (typeof r?.created_at === "string" && r.created_at) ||
            new Date().toISOString();

          const type: Resource["type"] =
            r?.type === "PDF" || r?.type === "Link" || r?.type === "Audio" || r?.type === "Fișă"
              ? r.type
              : "Link";

          return {
            id: String(r?.id ?? uid("r")),
            title: String(r?.title ?? "Resursă"),
            type,
            description: typeof r?.description === "string" ? r.description : undefined,
            href: typeof r?.href === "string" ? r.href : undefined,
            addedAt: added,
          };
        })
      : [];

    setExercises(nextExercises);
    setResources(nextResources);
  }, []);

  React.useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        await loadPlan();
      } catch (e: any) {
        console.error("Load plan error", e);
        if (!alive) return;
        setError(typeof e?.message === "string" ? e.message : "Nu am putut încărca planul.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [loadPlan]);

  const activeGoals = goals.filter((g) => g.status === "Activ");
  const pausedGoals = goals.filter((g) => g.status === "În pauză");
  const doneGoals = goals.filter((g) => g.status === "Încheiat");

  const progressSummary = React.useMemo(() => {
    const p = activeGoals.map((g) => (typeof g.progress === "number" ? g.progress : 0)).reduce((a, b) => a + b, 0);
    return activeGoals.length ? Math.round(p / activeGoals.length) : 0;
  }, [activeGoals]);

  function openCreateGoalModal() {
    setEditingGoalId(null);
    setGoalDraftTitle("");
    setGoalDraftProgress(0);
    setGoalDraftStatus("Activ");
    setGoalModalOpen(true);
  }

  function openEditGoalModal(goal: Goal) {
    setEditingGoalId(goal.id);
    setGoalDraftTitle(goal.title);
    setGoalDraftProgress(typeof goal.progress === "number" ? goal.progress : 0);
    setGoalDraftStatus(goal.status);
    setGoalModalOpen(true);
  }

  async function saveGoalFromModal() {
    if (addingGoal) return;

    const title = (goalDraftTitle || "").trim();
    if (!title) {
      setError("Te rog scrie un titlu pentru obiectiv.");
      return;
    }

    try {
      setAddingGoal(true);
      setError(null);

      if (!editingGoalId) {
        const resp = await createGoal({
          title,
          progress: goalDraftProgress,
          status: goalDraftStatus,
        });

        const created = (resp as any)?.goal ?? (resp as any)?.data?.goal ?? (resp as any)?.item ?? null;
        if (created) {
          const updatedAt = pickUpdatedAt(created);
          const mapped: Goal = {
            id: String(created?.id ?? uid("g")),
            title: String(created?.title ?? title),
            subtitle: typeof created?.subtitle === "string" ? created.subtitle : undefined,
            status: apiStatusToUi(created?.status ?? goalDraftStatus),
            progress: typeof created?.progress === "number" ? created.progress : goalDraftProgress,
            updatedAt,
            therapistId: created?.therapistId == null ? null : String(created.therapistId),
          };

          setGoals((prev) => {
            const without = prev.filter((g) => g.id !== mapped.id);
            return [mapped, ...without];
          });
        }

        if (goalsListSupported) await loadPlan();
        closeGoalModal();
        return;
      }

      const id = String(editingGoalId);

      // optimistic
      setGoals((prev) =>
        prev.map((g) =>
          g.id === id
            ? { ...g, title, progress: goalDraftProgress, status: goalDraftStatus, updatedAt: new Date().toISOString() }
            : g
        )
      );
      closeGoalModal();

      try {
        const resp = await updateGoal(id, { title, progress: goalDraftProgress, status: goalDraftStatus });
        const updated = (resp as any)?.goal ?? (resp as any)?.data?.goal ?? (resp as any)?.item ?? null;

        if (updated) {
          const updatedAt = pickUpdatedAt(updated);
          setGoals((prev) =>
            prev.map((g) =>
              g.id === id
                ? {
                    ...g,
                    title: String(updated?.title ?? title),
                    status: apiStatusToUi(updated?.status ?? goalDraftStatus),
                    progress:
                      typeof updated?.progress === "number" ? updated.progress : goalDraftProgress,
                    updatedAt,
                  }
                : g
            )
          );
        } else if (goalsListSupported) {
          await loadPlan();
        }
      } catch (e: any) {
        console.error("Update goal backend error", e);
        setError(typeof e?.message === "string" ? e.message : "Serverul nu a confirmat update-ul.");
      }
    } catch (e: any) {
      console.error("Save goal error", e);
      setError(typeof e?.message === "string" ? e.message : "Nu am putut salva obiectivul.");
    } finally {
      setAddingGoal(false);
    }
  }

  async function deleteGoal(id: string) {
    if (!id) return;
    const ok = window.confirm("Ștergi obiectivul? Acțiunea nu poate fi anulată.");
    if (!ok) return;

    try {
      setError(null);
      setGoals((prev) => prev.filter((g) => g.id !== id));
      await apiDeleteGoal(id);
      if (goalsListSupported) await loadPlan();
    } catch (e: any) {
      console.error("Delete goal error", e);
      setError(typeof e?.message === "string" ? e.message : "Nu am putut șterge obiectivul.");
      try {
        await loadPlan();
      } catch {}
    }
  }

  function addExercise() {
    const next: Exercise = {
      id: uid("e"),
      title: "Exercițiu nou (local)",
      kind: "Exercițiu",
      minutes: 5,
      note: "Completează când ești gata.",
    };
    setExercises((prev) => [next, ...prev]);
  }

  function addResource() {
    const next: Resource = {
      id: uid("r"),
      title: "Resursă nouă (local)",
      type: "Link",
      description: "Adaugă un link sau o fișă de lucru.",
      href: "#",
      addedAt: new Date().toISOString(),
    };
    setResources((prev) => [next, ...prev]);
  }

  return (
    <section className="mx-auto max-w-6xl space-y-8">
      {error ? (
        <div className="rounded-2xl border border-rose-100 bg-rose-50/70 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-3xl border border-white/60 bg-white/60 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-2.5 w-2.5 rounded-full bg-indigo-500/70 animate-pulse" />
            <p className="text-sm font-semibold text-gray-900">Se încarcă planul…</p>
          </div>
          <p className="mt-1 text-sm text-gray-600">Doar o clipă — adunăm obiectivele tale.</p>
        </div>
      ) : null}

      <PlanHeader
        activeGoalsCount={activeGoals.length}
        exercisesCount={exercises.length}
        progressSummary={progressSummary}
        addingGoal={addingGoal}
        onAddGoal={openCreateGoalModal}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <GoalsSection
            loading={loading}
            goals={goals}
            activeGoals={activeGoals}
            pausedGoals={pausedGoals}
            doneGoals={doneGoals}
            addingGoal={addingGoal}
            onAdd={openCreateGoalModal}
            onEdit={openEditGoalModal}
            onDelete={deleteGoal}
          />

          <ExercisesSection loading={loading} exercises={exercises} onAdd={addExercise} />
        </div>

        <div className="space-y-6">
          <ResourcesSection loading={loading} resources={resources} onAdd={addResource} />

          <div
            className="rounded-[28px] border border-white/60 bg-white/60 p-5 shadow-sm"
            style={{
              background:
                "radial-gradient(circle at 20% 10%, rgba(99,102,241,0.18), rgba(236,72,153,0.10), rgba(255,255,255,0.65))",
            }}
          >
            <p className="text-sm font-semibold text-gray-900">Pasul de azi</p>
            <p className="mt-1 text-sm text-gray-700/90 leading-relaxed">
              Dacă totul pare mult, alege <span className="font-semibold">un singur lucru</span>: 1 minut respirație,
              3 rânduri în jurnal, sau un exercițiu mic din listă.
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

          <div className="rounded-[28px] border border-white/60 bg-white/60 p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-900">Notă</p>
            <p className="mt-1 text-sm text-gray-600 leading-relaxed">
              Pagina e legată de backend prin <span className="font-semibold text-gray-800">/api/client/plan</span>.
              Dacă unele secțiuni sunt goale, înseamnă că încă nu ai obiective/exerciții/resurse setate.
            </p>
          </div>
        </div>
      </div>

      <GoalModal
        open={goalModalOpen}
        editing={Boolean(editingGoalId)}
        title={goalDraftTitle}
        progress={goalDraftProgress}
        status={goalDraftStatus}
        adding={addingGoal}
        onClose={closeGoalModal}
        onChangeTitle={setGoalDraftTitle}
        onChangeProgress={setGoalDraftProgress}
        onChangeStatus={setGoalDraftStatus}
        onSave={saveGoalFromModal}
      />
    </section>
  );
}