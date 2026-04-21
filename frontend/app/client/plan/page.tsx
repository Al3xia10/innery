"use client";

import * as React from "react";
import dynamic from "next/dynamic";

import PlanHeader from "./components/PlanHeader";
import GoalsSection from "./components/GoalsSection";
import GoalModal from "./components/GoalModal";
import ExercisesSection from "./components/ExercisesSection";
import SectionLoadingCard from "@/app/components/ui/SectionLoadingCard";
import ConfirmDialog from "@/app/components/ui/ConfirmDialog";
import ErrorStateCard from "@/app/components/ui/ErrorStateCard";
import { useToast } from "@/app/components/ui/toast/ToastProvider";

import type { Goal, Exercise, GoalStatus } from "./lib/goalTypes";
import { uid, apiStatusToUi, mapApiGoalToGoal, pickUpdatedAt } from "./lib/goalTypes";

const EXERCISES_API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  "http://localhost:4000";

function buildExercisesUrl(path: string) {
  return new URL(path, EXERCISES_API_BASE).toString();
}

function isJwtExpired(token: string) {
  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return true;

    const payload = JSON.parse(atob(payloadPart));
    if (!payload?.exp) return false;

    const now = Math.floor(Date.now() / 1000);
    return payload.exp <= now;
  } catch {
    return true;
  }
}

function getStoredAccessToken() {
  if (typeof window === "undefined") return null;

  const preferredKeys = [
    "innery_access_token_client",
    "innery_access_token",
    "innery_accessToken",
    "token",
    "accessToken",
    "access_token",
    "authToken",
    "jwt",
  ];

  for (const key of preferredKeys) {
    const value = window.localStorage.getItem(key);
    if (value && typeof value === "string" && !isJwtExpired(value)) {
      return value;
    }
  }

  return null;
}

type ExerciseWithDone = Exercise & { done?: boolean };
import {
  fetchPlan,
  fetchGoalsList,
  createGoal,
  updateGoal,
  deleteGoal as apiDeleteGoal,
  toggleGoalStep as apiToggleGoalStep,
} from "./lib/goalApi";

const ExerciseModal = dynamic(() => import("./components/ExerciseModal"), {
  ssr: false,
});

export default function PlanPage() {
  const toast = useToast();
  const [goals, setGoals] = React.useState<Goal[]>([]);
  const [exercises, setExercises] = React.useState<ExerciseWithDone[]>([]);

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [addingGoal, setAddingGoal] = React.useState(false);
  const [goalsListSupported, setGoalsListSupported] = React.useState<boolean | null>(null);

  const [goalModalOpen, setGoalModalOpen] = React.useState(false);
  const [goalDraftTitle, setGoalDraftTitle] = React.useState<string>("");
  const [goalDraftProgress, setGoalDraftProgress] = React.useState<number>(0);
  const [goalDraftStatus, setGoalDraftStatus] = React.useState<GoalStatus>("Activ");
  const [editingGoalId, setEditingGoalId] = React.useState<string | null>(null);
  const [exerciseModalOpen, setExerciseModalOpen] = React.useState(false);
  const [exerciseDraftTitle, setExerciseDraftTitle] = React.useState("");
  const [exerciseDraftKind, setExerciseDraftKind] = React.useState<"Exercițiu" | "Rutină">("Exercițiu");
  const [exerciseDraftMinutes, setExerciseDraftMinutes] = React.useState<number>(5);
  const [exerciseDraftNote, setExerciseDraftNote] = React.useState("");
  const [addingExercise, setAddingExercise] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState<{
    kind: "goal" | "exercise";
    id: string;
  } | null>(null);
  const pendingDeleteTimersRef = React.useRef<Map<string, number>>(new Map());
  const pendingDeletedGoalsRef = React.useRef<Map<string, Goal>>(new Map());
  const pendingDeletedExercisesRef = React.useRef<Map<string, ExerciseWithDone>>(new Map());

  React.useEffect(() => {
    const timers = pendingDeleteTimersRef.current;
    return () => {
      for (const timer of timers.values()) {
        window.clearTimeout(timer);
      }
      timers.clear();
    };
  }, []);

  const closeGoalModal = React.useCallback(() => {
    setGoalModalOpen(false);
    setEditingGoalId(null);
    setGoalDraftTitle("");
    setGoalDraftProgress(0);
    setGoalDraftStatus("Activ");
  }, []);
  const closeExerciseModal = React.useCallback(() => {
    setExerciseModalOpen(false);
    setExerciseDraftTitle("");
    setExerciseDraftKind("Exercițiu");
    setExerciseDraftMinutes(5);
    setExerciseDraftNote("");
  }, []);

  const openCreateExerciseModal = React.useCallback(() => {
    setExerciseDraftTitle("");
    setExerciseDraftKind("Exercițiu");
    setExerciseDraftMinutes(5);
    setExerciseDraftNote("");
    setExerciseModalOpen(true);
  }, []);

  const loadPlan = React.useCallback(async () => {
    const token = getStoredAccessToken();

const [data, listGoalsResult, exercisesRes] = await Promise.all([
  fetchPlan(),
  fetchGoalsList(),
  fetch(buildExercisesUrl("/api/client/exercises"), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }),
]);

const exercisesJson = await exercisesRes.json();

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

    const nextExercises: ExerciseWithDone[] = Array.isArray(exercisesJson?.exercises)
  ? exercisesJson.exercises.map((e: any) => ({
      id: String(e.id),
      title: e.title,
      kind: e.kind,
      minutes: e.minutes ?? undefined,
      note: e.note ?? undefined,
      done: e.done,
    }))
  : [];

    setExercises(nextExercises);
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

  const activeGoals = React.useMemo(
    () => goals.filter((g) => g.status === "Activ"),
    [goals]
  );
  const pausedGoals = React.useMemo(
    () => goals.filter((g) => g.status === "În pauză"),
    [goals]
  );
  const doneGoals = React.useMemo(
    () => goals.filter((g) => g.status === "Încheiat"),
    [goals]
  );

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

        try {
          await loadPlan();
        } catch {
          // Keep optimistic state if refresh fails.
        }
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
      console.error("Salvează goal error", e);
      setError(typeof e?.message === "string" ? e.message : "Nu am putut salva obiectivul.");
    } finally {
      setAddingGoal(false);
    }
  }

  async function commitDeleteGoal(id: string) {
    try {
      await apiDeleteGoal(id);
      pendingDeletedGoalsRef.current.delete(id);
      pendingDeleteTimersRef.current.delete(`goal:${id}`);
      if (goalsListSupported) await loadPlan();
    } catch (e: any) {
      console.error("Șterge goal error", e);
      const snapshot = pendingDeletedGoalsRef.current.get(id);
      if (snapshot) {
        setGoals((prev) => {
          if (prev.some((g) => g.id === snapshot.id)) return prev;
          return [snapshot, ...prev].sort(
            (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        });
      }
      setError(typeof e?.message === "string" ? e.message : "Nu am putut șterge obiectivul.");
      pendingDeletedGoalsRef.current.delete(id);
      pendingDeleteTimersRef.current.delete(`goal:${id}`);
    }
  }

  function undoDeleteGoal(id: string) {
    const key = `goal:${id}`;
    const timer = pendingDeleteTimersRef.current.get(key);
    if (timer) window.clearTimeout(timer);
    pendingDeleteTimersRef.current.delete(key);
    const snapshot = pendingDeletedGoalsRef.current.get(id);
    if (!snapshot) return;
    setGoals((prev) => {
      if (prev.some((g) => g.id === snapshot.id)) return prev;
      return [snapshot, ...prev].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    });
    pendingDeletedGoalsRef.current.delete(id);
  }

  function deleteGoal(id: string) {
    if (!id) return;
    const existing = goals.find((g) => g.id === id);
    if (!existing) return;
    setError(null);
    pendingDeletedGoalsRef.current.set(id, existing);
    setGoals((prev) => prev.filter((g) => g.id !== id));
    const key = `goal:${id}`;
    const timer = window.setTimeout(() => {
      void commitDeleteGoal(id);
    }, 5000);
    pendingDeleteTimersRef.current.set(key, timer);
    toast.info("Obiectivul a fost șters.", {
      actionLabel: "Anulează",
      onAction: () => undoDeleteGoal(id),
    });
  }

  async function handleToggleGoalStep(goalId: string, stepId: string, nextDone: boolean) {
    if (!goalId || !stepId) return;

    const previousGoals = goals;
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== goalId) return g;
        const steps = (g.steps ?? []).map((s) =>
          s.id === stepId ? { ...s, done: nextDone } : s
        );
        const doneCount = steps.filter((s) => s.done).length;
        const progress = steps.length ? Math.round((doneCount / steps.length) * 100) : 0;
        return {
          ...g,
          steps,
          stepsDone: doneCount,
          stepsTotal: steps.length,
          progress,
          status: progress === 100 ? "Încheiat" : g.status === "Încheiat" ? "Activ" : g.status,
          updatedAt: new Date().toISOString(),
        };
      })
    );

    try {
      const resp = await apiToggleGoalStep(goalId, stepId, nextDone);
      const serverGoal = (resp as any)?.goal ?? null;

      if (serverGoal) {
        setGoals((prev) =>
          prev.map((g) =>
            g.id === goalId
              ? {
                  ...g,
                  progress:
                    typeof serverGoal.progress === "number" ? serverGoal.progress : g.progress,
                  status:
                    serverGoal.status === "done"
                      ? "Încheiat"
                      : serverGoal.status === "paused"
                      ? "În pauză"
                      : "Activ",
                  stepsDone:
                    typeof serverGoal.stepsDone === "number"
                      ? serverGoal.stepsDone
                      : g.stepsDone,
                  stepsTotal:
                    typeof serverGoal.stepsTotal === "number"
                      ? serverGoal.stepsTotal
                      : g.stepsTotal,
                }
              : g
          )
        );
      }
    } catch (e: any) {
      console.error("Toggle goal step error", e);
      setGoals(previousGoals);
      setError(typeof e?.message === "string" ? e.message : "Nu am putut actualiza pasul.");
    }
  }

    async function addExercise() {
    const title = exerciseDraftTitle.trim();

    if (!title) {
      setError("Te rog scrie un titlu pentru exercițiu.");
      return;
    }

    try {
      setAddingExercise(true);
      setError(null);

      const token = getStoredAccessToken();

      if (!token) {
        setError("Sesiunea a expirat. Te rog reconectează-te.");
        return;
      }

      const res = await fetch(buildExercisesUrl("/api/client/exercises"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          kind: exerciseDraftKind,
          minutes: exerciseDraftMinutes,
          note: exerciseDraftNote.trim() || undefined,
        }),
      });

      if (res.status === 401) {
        setError("Sesiunea a expirat. Te rog reconectează-te.");
        return;
      }

      const json = await res.json();

      if (!res.ok) {
        throw new Error(typeof json?.message === "string" ? json.message : "Nu am putut crea exercițiul.");
      }

      if (json?.exercise) {
        const e = json.exercise;
        const mapped: ExerciseWithDone = {
          id: String(e.id),
          title: e.title,
          kind: e.kind,
          minutes: e.minutes ?? undefined,
          note: e.note ?? undefined,
          done: e.done,
        };

        setExercises((prev) => [mapped, ...prev]);
      }

      closeExerciseModal();
    } catch (e) {
      console.error("Add exercise error", e);
      setError("Nu am putut crea exercițiul.");
    } finally {
      setAddingExercise(false);
    }
  }

  async function handleToggleExerciseDone(id: number) {
    const prev = exercises;

    setExercises((exs) =>
      exs.map((e) =>
        Number(e.id) === id ? { ...e, done: !e.done } : e
      )
    );

    try {
      const target = prev.find((e) => Number(e.id) === id);
      if (!target) return;

      const token = getStoredAccessToken();

      if (!token) {
        throw new Error("Nu am găsit token-ul clientului în browser.");
      }

      const res = await fetch(buildExercisesUrl(`/api/client/exercises/${id}`), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ done: !target.done }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(
          typeof json?.message === "string"
            ? json.message
            : "Nu am putut actualiza exercițiul."
        );
      }
    } catch (e) {
      console.error("Toggle exercise error", e);
      setExercises(prev);
      setError("Nu am putut actualiza exercițiul.");
    }
  }

  async function commitDeleteExercise(id: number) {
    try {
      const token = getStoredAccessToken();
      if (!token) {
        throw new Error("Nu am găsit token-ul clientului în browser.");
      }

      const res = await fetch(buildExercisesUrl(`/api/client/exercises/${id}`), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(
          typeof json?.message === "string" ? json.message : "Nu am putut șterge exercițiul."
        );
      }
      pendingDeletedExercisesRef.current.delete(String(id));
      pendingDeleteTimersRef.current.delete(`exercise:${id}`);
    } catch (e) {
      console.error("Șterge exercise error", e);
      const snapshot = pendingDeletedExercisesRef.current.get(String(id));
      if (snapshot) {
        setExercises((prev) => [snapshot, ...prev]);
      }
      setError("Nu am putut șterge exercițiul.");
      pendingDeletedExercisesRef.current.delete(String(id));
      pendingDeleteTimersRef.current.delete(`exercise:${id}`);
    }
  }

  function undoDeleteExercise(id: number) {
    const key = `exercise:${id}`;
    const timer = pendingDeleteTimersRef.current.get(key);
    if (timer) window.clearTimeout(timer);
    pendingDeleteTimersRef.current.delete(key);
    const snapshot = pendingDeletedExercisesRef.current.get(String(id));
    if (!snapshot) return;
    setExercises((prev) => [snapshot, ...prev]);
    pendingDeletedExercisesRef.current.delete(String(id));
  }

  function deleteExercise(id: number) {
    const existing = exercises.find((e) => Number(e.id) === id);
    if (!existing) return;
    setExercises((curr) => curr.filter((e) => Number(e.id) !== id));
    pendingDeletedExercisesRef.current.set(String(id), existing);
    const key = `exercise:${id}`;
    const timer = window.setTimeout(() => {
      void commitDeleteExercise(id);
    }, 5000);
    pendingDeleteTimersRef.current.set(key, timer);
    toast.info("Exercițiul a fost șters.", {
      actionLabel: "Anulează",
      onAction: () => undoDeleteExercise(id),
    });
  }


  return (
    <section className="mx-auto max-w-6xl px-3 py-6 space-y-6 sm:px-6 sm:py-8 sm:space-y-8 lg:px-8">
      {error ? <ErrorStateCard message={error} /> : null}

      {loading ? (
        <SectionLoadingCard
          title="Se încarcă planul…"
          description="Doar o clipă — adunăm obiectivele tale."
        />
      ) : null}

      <PlanHeader
        activeGoalsCount={activeGoals.length}
        exercisesCount={exercises.length}
        progressSummary={progressSummary}
        addingGoal={addingGoal}
        onAddGoal={openCreateGoalModal}
      />

      <div className="space-y-8">
        <div className="space-y-8">
          <GoalsSection
            loading={loading}
            goals={goals}
            activeGoals={activeGoals}
            pausedGoals={pausedGoals}
            doneGoals={doneGoals}
            addingGoal={addingGoal}
            onAdd={openCreateGoalModal}
            onEdit={openEditGoalModal}
            onDelete={(id) => setConfirmDelete({ kind: "goal", id })}
            onToggleStep={handleToggleGoalStep}
          />

          <ExercisesSection
            loading={loading}
            exercises={exercises}
            onAdd={openCreateExerciseModal}
            onToggleDone={handleToggleExerciseDone}
            onDelete={(id) => setConfirmDelete({ kind: "exercise", id: String(id) })}
          />
        </div>
      </div>

      <GoalModal
        open={goalModalOpen}
        editing={Boolean(editingGoalId)}
        title={goalDraftTitle}
        status={goalDraftStatus}
        adding={addingGoal}
        onClose={closeGoalModal}
        onChangeTitle={setGoalDraftTitle}
        onChangeStatus={setGoalDraftStatus}
        onSave={saveGoalFromModal}
      />
      <ExerciseModal
        open={exerciseModalOpen}
        title={exerciseDraftTitle}
        kind={exerciseDraftKind}
        minutes={exerciseDraftMinutes}
        note={exerciseDraftNote}
        saving={addingExercise}
        onClose={closeExerciseModal}
        onChangeTitle={setExerciseDraftTitle}
        onChangeKind={setExerciseDraftKind}
        onChangeMinutes={setExerciseDraftMinutes}
        onChangeNote={setExerciseDraftNote}
        onSave={addExercise}
      />
      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Confirmă ștergerea"
        message="Acțiunea poate fi anulată din notificare pentru câteva secunde."
        confirmText="Șterge"
        cancelText="Anulează"
        danger
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (!confirmDelete) return;
          if (confirmDelete.kind === "goal") {
            deleteGoal(confirmDelete.id);
          } else {
            deleteExercise(Number(confirmDelete.id));
          }
          setConfirmDelete(null);
        }}
      />
    </section>
  );
}
