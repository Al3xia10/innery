export type GoalStatus = "Activ" | "În pauză" | "Încheiat";
export type ApiGoalStatus = "active" | "paused" | "done";

export type GoalStep = {
  id: string;
  title: string;
  done: boolean;
  orderIndex?: number;
};

export type ApiPlanResponse = {
  goals?: Array<{
    id: number | string;
    title: string;
    status?: ApiGoalStatus | GoalStatus;
    therapistId?: number | string | null;
    clientUserId?: number | string | null;

    updatedAt?: string;
    updated_at?: string;
    createdAt?: string;
    created_at?: string;

    progress?: number;
    subtitle?: string;
  }>;
  exercises?: Array<any>;
  resources?: Array<any>;
  plan?: any;
};

export type ApiGoalsListResponse =
  | { goals: ApiPlanResponse["goals"] }
  | { data?: { goals?: ApiPlanResponse["goals"] } }
  | Array<any>;

export type Goal = {
  id: string;
  title: string;
  subtitle?: string;
  status: GoalStatus;
  progress?: number; // 0..100
  steps?: GoalStep[];
  stepsDone?: number;
  stepsTotal?: number;
  updatedAt: string;
  therapistId?: string | null;
};

export type Exercise = {
  id: string;
  title: string;
  kind: "Exercițiu" | "Experiment" | "Rutină";
  minutes?: number;
  note?: string;
};

export type Resource = {
  id: string;
  title: string;
  type: "PDF" | "Link" | "Audio" | "Fișă";
  description?: string;
  href?: string;
  addedAt: string;
};

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function toNiceDate(raw: string) {
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "2-digit" });
}

export function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

export function apiStatusToUi(s?: ApiGoalStatus | GoalStatus): GoalStatus {
  if (!s) return "Activ";
  if (s === "Activ" || s === "În pauză" || s === "Încheiat") return s;
  if (s === "paused") return "În pauză";
  if (s === "done") return "Încheiat";
  return "Activ";
}

export function uiStatusToApi(s: GoalStatus): ApiGoalStatus {
  if (s === "În pauză") return "paused";
  if (s === "Încheiat") return "done";
  return "active";
}

export function pickUpdatedAt(g: any): string {
  return (
    (typeof g?.updatedAt === "string" && g.updatedAt) ||
    (typeof g?.updated_at === "string" && g.updated_at) ||
    (typeof g?.createdAt === "string" && g.createdAt) ||
    (typeof g?.created_at === "string" && g.created_at) ||
    new Date().toISOString()
  );
}

export function mapApiGoalToGoal(g: any): Goal {
  const updatedAt = pickUpdatedAt(g);

  const steps = Array.isArray(g?.steps)
    ? g.steps
        .map((s: any) => ({
          id: String(s?.id),
          title: String(s?.title ?? "Pas"),
          done: Boolean(s?.done),
          orderIndex: typeof s?.orderIndex === "number" ? s.orderIndex : undefined,
        }))
        .sort((a: GoalStep, b: GoalStep) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
    : [];

  const progressRaw = g?.progress;
  const computedProgress = steps.length
    ? Math.round((steps.filter((s: GoalStep) => s.done).length / steps.length) * 100)
    : 0;
  const progress = typeof progressRaw === "number" ? progressRaw : computedProgress;

  return {
    id: String(g?.id),
    title: String(g?.title ?? "Obiectiv"),
    subtitle: typeof g?.subtitle === "string" ? g.subtitle : undefined,
    status: apiStatusToUi(g?.status),
    progress,
    steps,
    stepsDone:
      typeof g?.stepsDone === "number"
        ? g.stepsDone
        : steps.filter((s: GoalStep) => s.done).length,
    stepsTotal: typeof g?.stepsTotal === "number" ? g.stepsTotal : steps.length,
    updatedAt,
    therapistId: g?.therapistId == null ? null : String(g.therapistId),
  };
}
