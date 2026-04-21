export default function Workflow() {
  const steps = [
    {
      step: "01",
      title: "Creeaza un spatiu pentru client",
      text:
        "Configureaza un spatiu privat pentru fiecare client cu notite, reflectii si context din prima zi.",
    },
    {
      step: "02",
      title: "Documenteaza clar sedintele",
      text:
        "Noteaza sedintele intr-o structura clara ca progresul si temele sa fie usor de urmarit in timp.",
    },
    {
      step: "03",
      title: "Ramai conectat(a) intre sedinte",
      text:
        "Revizuieste reflectiile clientului si follow-up-urile pentru continuitate, fara mesaje constante.",
    },
    {
      step: "04",
      title: "Incepe fiecare sedinta cu context",
      text:
        "Incepi sedintele stiind unde ati ramas — fara sa cauti prin notite vechi.",
    },
  ];

  return (
    <section className="bg-(--color-card)/40">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center mb-14">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 leading-tight">
            Un flux simplu care iti sustine munca
          </h2>
          <p className="mt-4 text-sm md:text-base text-gray-600 leading-relaxed">
            Innery se potriveste natural in sedintele de terapie — fara un proces rigid.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {steps.map((item) => (
            <div
              key={item.step}
              className="relative rounded-2xl border border-(--color-soft) bg-white p-6 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-(--color-accent) border border-(--color-accent) text-sm font-semibold">
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