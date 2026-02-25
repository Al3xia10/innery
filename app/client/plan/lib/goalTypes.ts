export type GoalStatus = "Activ" | "În pauză" | "Încheiat";
export type ApiGoalStatus = "active" | "paused" | "done";

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

  const progressRaw = g?.progress;
  const progress = typeof progressRaw === "number" ? progressRaw : undefined;

  return {
    id: String(g?.id),
    title: String(g?.title ?? "Obiectiv"),
    subtitle: typeof g?.subtitle === "string" ? g.subtitle : undefined,
    status: apiStatusToUi(g?.status),
    progress,
    updatedAt,
    therapistId: g?.therapistId == null ? null : String(g.therapistId),
  };
}