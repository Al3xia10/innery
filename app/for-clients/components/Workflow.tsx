export default function Workflow() {
  const steps = [
    {
      step: "01",
      title: "Alatura-te prin terapeutul tau",
      text:
        "Terapeutul tau te invita in Innery, creand un spatiu comun si privat pentru munca voastra.",
    },
    {
      step: "02",
      title: "Reflecteaza intre sedinte",
      text:
        "Scrie ganduri, emotii sau intrebari cand apar — in ritmul tau.",
    },
    {
      step: "03",
      title: "Ramai conectat(a) la procesul tau",
      text:
        "Reflectiile tale mentin continuitatea, ca momentele importante sa nu se piarda intre sedinte.",
    },
    {
      step: "04",
      title: "Vino cu claritate",
      text:
        "Incepe fiecare sedinta ancorat(a), fara sa reexplici ce a contat data trecuta.",
    },
  ];

  return (
    <section className="bg-(--color-card)/40">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center mb-14">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 leading-tight">
            Cum se potriveste in terapia ta
          </h2>
          <p className="mt-4 text-sm md:text-base text-gray-600 leading-relaxed">
            Innery iti sustine parcursul terapeutic bland — fara presiune sau interactiune constanta.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {steps.map((item) => (
            <div
              key={item.step}
              className="relative rounded-2xl border border-(--color-soft) bg-white p-6 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-(--color-accent) border border-(--color-accent) text-sm font-semibold ">
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