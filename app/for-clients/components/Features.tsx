export default function Features() {
  const features = [
    {
      title: "A private space for your thoughts",
      text:
        "Write reflections between sessions in a calm, personal space — without pressure or constant messaging.",
    },
    {
      title: "Continuity between sessions",
      text:
        "Your therapist sees what matters to you before each session, so you don’t have to start from zero.",
    },
    {
      title: "Clarity, not clutter",
      text:
        "Everything related to your therapy lives in one place — notes, reflections, and shared context.",
    },
    {
      title: "Safe and respectful by design",
      text:
        "Your information stays private, structured, and shared only within the therapeutic relationship.",
    },
  ];

  return (
    <section className="bg-(--color-card)/40">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 leading-tight">
            Designed to support your therapy
          </h2>
          <p className="mt-4 text-sm md:text-base text-gray-600 leading-relaxed">
            Innery helps you stay connected to your process — calmly, privately, and at your own pace.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
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