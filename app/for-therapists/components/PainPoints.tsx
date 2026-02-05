export default function PainPoints() {
  const less = [
    {
      title: "Scattered notes",
      text: "Session notes, reflections, and follow-ups living in different places.",
    },
    {
      title: "Rebuilding context every session",
      text: "Spending the first minutes remembering what mattered last time.",
    },
    {
      title: "Admin that steals focus",
      text: "Documentation that adds cognitive load instead of reducing it.",
    },
  ];

  const more = [
    {
      title: "One client space",
      text: "A private, organized workspace per client — always up to date.",
    },
    {
      title: "Clear continuity",
      text: "Start sessions with context in seconds, not minutes.",
    },
    {
      title: "A calmer workflow",
      text: "Structure that supports clinical work without becoming another system.",
    },
  ];

  return (
    <section className="bg-[#F7F8FC]">
      <div className="mx-auto max-w-6xl px-6 py-18 md:py-20">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 leading-snug">
           Less overhead. Keep your focus on therapy.
          </h2>
          <p className="mt-3 text-sm md:text-base text-gray-600 leading-relaxed">
            A calmer way to manage notes, reflections, and client context — without adding another system to think about.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* LESS */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-xs uppercase tracking-wide font-semibold text-gray-500">
                Less of this
              </h3>
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                friction
              </span>
            </div>

            <ul className="mt-5 space-y-4">
              {less.map((item) => (
                <li key={item.title} className="flex gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-600">
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
                        d="M6 18 18 6M6 6l12 12"
                      />
                    </svg>
                  </span>

                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {item.title}
                    </p>
                    <p className="mt-1 text-sm text-gray-600 leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* MORE */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-xs uppercase tracking-wide font-semibold text-gray-500">
                More of this
              </h3>
              <span className="rounded-full bg-indigo-600/10 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                clarity
              </span>
            </div>

            <ul className="mt-5 space-y-4">
              {more.map((item) => (
                <li key={item.title} className="flex gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600/10 text-indigo-700">
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
                    <p className="text-sm font-medium text-gray-900">
                      {item.title}
                    </p>
                    <p className="mt-1 text-sm text-gray-600 leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

    
      </div>
    </section>
  );
}