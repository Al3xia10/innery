

"use client";

export default function PainPoints() {
  const less = [
    {
      title: "Thoughts get lost",
      text: "Important moments end up in Notes, messages, or nowhere at all.",
    },
    {
      title: "Forgetting what mattered",
      text: "You remember the feeling, but not the details when the session starts.",
    },
    {
      title: "No clear sense of progress",
      text: "It’s hard to notice patterns when everything is scattered over time.",
    },
  ];

  const more = [
    {
      title: "One private space",
      text: "A calm place for reflections — organized, searchable, always there.",
    },
    {
      title: "Clear continuity",
      text: "Walk into sessions with context in seconds, not stress.",
    },
    {
      title: "Progress you can see",
      text: "Spot patterns, track changes, and build insight over weeks and months.",
    },
  ];

  return (
    <section className="bg-[#F7F8FC]">
      <div className="mx-auto max-w-6xl px-6 py-18 md:py-20">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 leading-snug">
            Less mental clutter. More clarity between sessions.
          </h2>
          <p className="mt-3 text-sm md:text-base text-gray-600 leading-relaxed">
            Innery helps you keep your reflections in one place — so therapy feels
            more continuous, even outside the session.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* LESS */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
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
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
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