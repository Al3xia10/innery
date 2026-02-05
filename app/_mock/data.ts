export const therapists = [
  { id: "t1", name: "Dr. Maria Popescu" },
  { id: "t2", name: "Dr. Andrei Ionescu" },
];

export const clients = [
  { id: "c1", name: "Alexia", therapistId: "t1" },
  { id: "c2", name: "Anna M.", therapistId: "t1" },
  { id: "c3", name: "Daniel R.", therapistId: "t2" },
];

export const sessions = [
  { id: "s1", clientId: "c1", therapistId: "t1", date: "2025-05-15" },
  { id: "s2", clientId: "c3", therapistId: "t2", date: "2025-05-16" },
];

export const notes = [
  { id: "n1", clientId: "c1", therapistId: "t1", title: "Session 1 notes" },
  { id: "n2", clientId: "c3", therapistId: "t2", title: "Initial assessment" },
];

export const reflections = [
  { id: "r1", clientId: "c1", date: "2025-05-10", content: "Felt anxious today." },
  { id: "r2", clientId: "c1", date: "2025-05-12", content: "Had a productive session." },
];