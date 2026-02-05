export default function Workflow() {
  const steps = [
    {
      step: "01",
      title: "Join through your therapist",
      text:
        "Your therapist invites you to Innery, creating a shared and private space for your work together.",
    },
    {
      step: "02",
      title: "Reflect between sessions",
      text:
        "Write thoughts, feelings, or questions whenever they come up — at your own pace.",
    },
    {
      step: "03",
      title: "Stay connected to your process",
      text:
        "Your reflections help maintain continuity, so important moments don’t get lost between sessions.",
    },
    {
      step: "04",
      title: "Arrive with clarity",
      text:
        "Begin each session feeling grounded, without needing to re-explain what mattered last time.",
    },
  ];

  return (
    <section className="bg-[#F7F8FC]">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center mb-14">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 leading-tight">
            How it fits into your therapy
          </h2>
          <p className="mt-4 text-sm md:text-base text-gray-600 leading-relaxed">
            Innery supports your therapeutic journey gently — without pressure or constant interaction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {steps.map((item) => (
            <div
              key={item.step}
              className="relative rounded-2xl bg-white p-6 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600/10 text-sm font-semibold text-indigo-700">
                  {item.step}
                </span>
                <h3 className="text-base font-semibold text-gray-900">
                  {item.title}
                </h3>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}