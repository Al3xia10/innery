import Link from "next/link";

const therapistSteps = [
  {
    title: "Create your workspace",
    text: "Set up your therapist space — where client work stays organized and private.",
  },
  {
    title: "Add a client profile",
    text: "Create a profile and keep a clear timeline for notes and context on each client.",
  },
  {
    title: "Write session notes",
    text: "Capture what matters after sessions using a simple structure that supports continuity.",
  },
  {
    title: "Review reflections (optional)",
    text: "If enabled, clients can submit short reflections between sessions for you to review.",
  },
] as const;

const clientSteps = [
  {
    title: "Join your client space",
    text: "Access your personal space connected to your therapist — calm, simple, and private.",
  },
  {
    title: "Add reflections",
    text: "Write short reflections between sessions so you don’t lose what felt important.",
  },
  {
    title: "Track your progress",
    text: "See your reflection history over time — patterns become easier to notice.",
  },
  {
    title: "Stay prepared",
    text: "Use your notes to bring clarity into your next session and focus on what matters.",
  },
] as const;

function StepList({
  items,
  tone,
}: {
  items: readonly { title: string; text: string }[];
  tone: "indigo" | "slate";
}) {
  const badge =
    tone === "indigo"
      ? "bg-indigo-600 text-white"
      : "bg-slate-900 text-white";

  return (
    <ol className="mt-6 space-y-5">
      {items.map((s, idx) => (
        <li key={s.title} className="flex gap-4">
          <div className="shrink-0">
            <div className={`h-8 w-8 rounded-xl grid place-items-center text-xs font-semibold ${badge}`}>
              {idx + 1}
            </div>
          </div>

          <div className="pt-0.5">
            <h3 className="text-sm font-semibold text-gray-900">{s.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{s.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export default function Steps() {
  return (
    <section className="bg-[#F7F8FC]">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="mt-2 text-xl md:text-2xl font-semibold text-gray-900 leading-snug">
            Understand the flow — for therapists and clients
          </h2>
          <p className="mt-3 text-sm md:text-base text-gray-600 leading-relaxed">
            Innery connects a therapist workspace with a client space — so notes, reflections, and
            continuity are easier on both sides.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-2">
          {/* Therapists */}
          <div className="rounded-2xl border border-gray-200 bg-white/60 p-6 md:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  For therapists
                </p>
                <p className="mt-1 text-sm text-gray-700">
                  A private workspace for client continuity.
                </p>
              </div>
              <span className="hidden sm:inline-flex rounded-full bg-white px-3 py-1 text-xs border border-gray-200 text-gray-600">
                Notes • Timeline • Context
              </span>
            </div>

            <StepList items={therapistSteps} tone="indigo" />

            <div className="mt-10">
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Create therapist account
              </Link>
            </div>
          </div>

          {/* Clients */}
          <div className="rounded-2xl border border-gray-200 bg-white/60 p-6 md:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  For clients
                </p>
                <p className="mt-1 text-sm text-gray-700">
                  A calm place to reflect between sessions.
                </p>
              </div>
              <span className="hidden sm:inline-flex rounded-full bg-white px-3 py-1 text-xs border border-gray-200 text-gray-600">
                Reflections • History • Clarity
              </span>
            </div>

            <StepList items={clientSteps} tone="slate" />

            <div className="mt-10">
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
              >
                Create client account
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 text-xs text-gray-500">
          Note: Client access is typically connected by their therapist (invite / code) once you add backend.
        </div>
      </div>
    </section>
  );
}