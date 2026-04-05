"use client";

import * as React from "react";

import PlanHeader from "./components/PlanHeader";
import GoalsSection from "./components/GoalsSection";
import GoalModal from "./components/GoalModal";
import ExercisesSection from "./components/ExercisesSection";


import type { Goal, Exercise, GoalStatus } from "./lib/goalTypes";
import { uid, apiStatusToUi, mapApiGoalToGoal, pickUpdatedAt } from "./lib/goalTypes";

const EXERCISES_API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

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
import { fetchPlan, fetchGoalsList, createGoal, updateGoal, deleteGoal as apiDeleteGoal } from "./lib/goalApi";


export default function PlanPage() {
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

  const closeGoalModal = React.useCallback(() => {
    setGoalModalOpen(false);
    setEditingGoalId(null);
    setGoalDraftTitle("");
    setGoalDraftProgress(0);
    setGoalDraftStatus("Activ");
  }, []);
    function closeExerciseModal() {
    setExerciseModalOpen(false);
    setExerciseDraftTitle("");
    setExerciseDraftKind("Exercițiu");
    setExerciseDraftMinutes(5);
    setExerciseDraftNote("");
  }

  function openCreateExerciseModal() {
    setExerciseDraftTitle("");
    setExerciseDraftKind("Exercițiu");
    setExerciseDraftMinutes(5);
    setExerciseDraftNote("");
    setExerciseModalOpen(true);
  }

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
      console.log("Using token:", token);

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
      console.log("toggle token found:", token);

      if (!token) {
        throw new Error("Nu am găsit token-ul clientului în browser.");
      }

      console.log("PATCH exercise URL:", buildExercisesUrl(`/api/client/exercises/${id}`));
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

  async function deleteExercise(id: number) {
    const ok = window.confirm("Ștergi exercițiul? Acțiunea nu poate fi anulată.");
    if (!ok) return;

    const prev = exercises;
    setExercises((curr) => curr.filter((e) => Number(e.id) !== id));

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
          typeof json?.message === "string"
            ? json.message
            : "Nu am putut șterge exercițiul."
        );
      }
    } catch (e) {
      console.error("Delete exercise error", e);
      setExercises(prev);
      setError("Nu am putut șterge exercițiul.");
    }
  }


  return (
    <section className="mx-auto max-w-6xl px-6 lg:px-8 py-8 space-y-8">
      {error ? (
        <div className="rounded-2xl border border-rose-100 bg-rose-50/70 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-[28px] border border-black/5 bg-white/80 p-5 shadow-[0_6px_14px_rgba(31,23,32,0.05)]">
          <div className="flex items-center gap-3">
            <div className="h-2.5 w-2.5 rounded-full bg-(--color-accent)/70 animate-pulse" />
            <p className="text-sm font-semibold text-foreground">Se încarcă planul…</p>
          </div>
          <p className="mt-1 text-sm text-(--color-foreground-muted,#6B5A63)">
            Doar o clipă — adunăm obiectivele tale.
          </p>
        </div>
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
            onDelete={deleteGoal}
          />

          <ExercisesSection
            loading={loading}
            exercises={exercises}
            onAdd={openCreateExerciseModal}
            onToggleDone={handleToggleExerciseDone}
            onDelete={deleteExercise}
          />
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
            {exerciseModalOpen ? (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-[rgba(24,18,24,0.32)] px-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-4xl border border-black/5 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(255,250,251,0.96)_100%)] shadow-[0_24px_60px_rgba(31,23,32,0.16)]">
            <div className="flex items-start justify-between gap-4 border-b border-black/5 px-6 py-5 sm:px-7">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8a7b84]">
                  Exercițiu nou
                </p>
                <h2 className="mt-2 text-[1.45rem] font-semibold tracking-tight text-foreground sm:text-[1.7rem]">
                  Adaugă un exercițiu
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-7 text-[#74656d]">
                  Creează un exercițiu sau o rutină pe care vrei să o urmezi în perioada asta.
                </p>
              </div>

              <button
                type="button"
                onClick={closeExerciseModal}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-black/5 bg-white text-lg text-[#7d5d6c] shadow-[0_4px_10px_rgba(31,23,32,0.04)] transition hover:bg-[#fff7fa]"
                aria-label="Închide"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 px-6 py-6 sm:grid-cols-2 sm:px-7">
              <label className="flex flex-col gap-2 sm:col-span-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8a7b84]">
                  Titlu
                </span>
                <input
                  value={exerciseDraftTitle}
                  onChange={(e) => setExerciseDraftTitle(e.target.value)}
                  className="rounded-2xl border border-black/5 bg-white px-4 py-3 text-sm text-foreground shadow-[0_4px_10px_rgba(31,23,32,0.03)] outline-none transition focus:border-[#e7bfd2] focus:ring-2 focus:ring-[#f6dce9]"
                  placeholder="De ex. Respirație 4-7-8"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8a7b84]">
                  Tip
                </span>
                <select
                  value={exerciseDraftKind}
                  onChange={(e) => setExerciseDraftKind(e.target.value as "Exercițiu" | "Rutină")}
                  className="rounded-2xl border border-black/5 bg-white px-4 py-3 text-sm text-foreground shadow-[0_4px_10px_rgba(31,23,32,0.03)] outline-none transition focus:border-[#e7bfd2] focus:ring-2 focus:ring-[#f6dce9]"
                >
                  <option value="Exercițiu">Exercițiu</option>
                  <option value="Rutină">Rutină</option>
                </select>
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8a7b84]">
                  Minute
                </span>
                <input
                  type="number"
                  min={1}
                  value={exerciseDraftMinutes}
                  onChange={(e) => setExerciseDraftMinutes(Number(e.target.value) || 0)}
                  className="rounded-2xl border border-black/5 bg-white px-4 py-3 text-sm text-foreground shadow-[0_4px_10px_rgba(31,23,32,0.03)] outline-none transition focus:border-[#e7bfd2] focus:ring-2 focus:ring-[#f6dce9]"
                />
              </label>

              <label className="flex flex-col gap-2 sm:col-span-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8a7b84]">
                  Notiță
                </span>
                <textarea
                  value={exerciseDraftNote}
                  onChange={(e) => setExerciseDraftNote(e.target.value)}
                  rows={4}
                  className="rounded-2xl border border-black/5 bg-white px-4 py-3 text-sm text-foreground shadow-[0_4px_10px_rgba(31,23,32,0.03)] outline-none transition focus:border-[#e7bfd2] focus:ring-2 focus:ring-[#f6dce9]"
                  placeholder="De ex. Dimineața, după cafea."
                />
              </label>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-black/5 px-6 py-5 sm:flex-row sm:justify-end sm:px-7">
              <button
                type="button"
                onClick={closeExerciseModal}
                className="inline-flex items-center justify-center rounded-full border border-black/5 bg-white px-5 py-2.5 text-sm font-semibold text-foreground shadow-[0_6px_14px_rgba(31,23,32,0.05)] transition hover:bg-[#fffafb]"
              >
                Renunță
              </button>
              <button
                type="button"
                onClick={addExercise}
                disabled={addingExercise}
                className="inline-flex items-center justify-center rounded-full bg-(--color-accent) px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(239,135,192,0.25)] transition hover:opacity-90 disabled:opacity-50"
              >
                {addingExercise ? "Se salvează..." : "Salvează exercițiul"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}