export default function Features() {
  const features = [
    {
      title: "Structured session notes",
      text:
        "Capture session notes in a consistent format so progress, themes, and decisions are easy to revisit.",
    },
    {
      title: "Client reflections between sessions",
      text:
        "Invite clients to share reflections and follow‑ups without turning therapy into constant messaging.",
    },
    {
      title: "Clear client overview",
      text:
        "See key context at a glance — recent notes, reflections, and what matters right now.",
    },
    {
      title: "Private by default",
      text:
        "Each client has a secure, therapist‑controlled space that supports ethical documentation and boundaries.",
    },
  ];

  return (
    <section className="bg-(--color-card)/40">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 leading-tight">
            Built around real therapy work
          </h2>
          <p className="mt-4 text-sm md:text-base text-gray-600 leading-relaxed">
            Innery focuses on structure and continuity — without adding another system to manage.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-(--color-soft) bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-(--color-accent) text-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </span>
              

                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">
                    {f.text}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}