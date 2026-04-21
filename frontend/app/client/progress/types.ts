// app/client/progress/types.ts
export type RangeKey = "7" | "30";

export type FocusMetric = "mood" | "anxiety" | "energy" | "sleep";

export type ProgressPoint = {
  day: string; // YYYY-MM-DD
  mood: number | null;
  anxiety: number | null;
  energy: number | null;
  sleepHours: number | null;
  count: number;
};

export type ProgressInsight = {
  id: string;
  text: string;
};

export type ProgressResponse = {
  progress: {
    rangeDays: number;
    series: ProgressPoint[];
    insights: ProgressInsight[];
  };
};