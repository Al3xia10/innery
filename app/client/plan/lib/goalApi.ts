import { apiFetch } from "@/app/_lib/authClient";
import type { ApiGoalsListResponse, ApiPlanResponse } from "./goalTypes";
import { uiStatusToApi } from "./goalTypes";

export async function fetchPlan(): Promise<ApiPlanResponse> {
  return (await apiFetch("/api/client/plan", { method: "GET" })) as ApiPlanResponse;
}

export async function fetchGoalsList(): Promise<{ supported: boolean; items: any[] }> {
  try {
    const res = (await apiFetch("/api/client/plan/goals", { method: "GET" })) as ApiGoalsListResponse;

    const goalsAny = Array.isArray(res)
      ? res
      : Array.isArray((res as any)?.goals)
      ? (res as any).goals
      : Array.isArray((res as any)?.data?.goals)
      ? (res as any).data.goals
      : [];

    return { supported: true, items: goalsAny as any[] };
  } catch {
    return { supported: false, items: [] };
  }
}

export async function createGoal(payload: {
  title: string;
  progress?: number;
  status?: "Activ" | "În pauză" | "Încheiat";
}) {
  const resp = await apiFetch("/api/client/plan/goals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: payload.title,
      progress: payload.progress ?? 0,
      status: uiStatusToApi(payload.status ?? "Activ"),
    }),
  });

  return resp as any;
}

export async function updateGoal(
  id: string,
  payload: {
    title: string;
    progress?: number;
    status?: "Activ" | "În pauză" | "Încheiat";
  }
) {
  const resp = await apiFetch(`/api/client/plan/goals/${id}` as any, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: payload.title,
      progress: payload.progress ?? 0,
      status: uiStatusToApi(payload.status ?? "Activ"),
    }),
  });

  return resp as any;
}

export async function deleteGoal(id: string) {
  return (await apiFetch(`/api/client/plan/goals/${id}` as any, {
    method: "DELETE",
  })) as any;
}

export async function toggleGoalStep(goalId: string, stepId: string, done: boolean) {
  return (await apiFetch(`/api/client/plan/goals/${goalId}/steps/${stepId}` as any, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ done }),
  })) as any;
}
