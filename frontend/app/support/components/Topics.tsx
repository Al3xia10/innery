const topics = [
  {
    title: "Client inexistent / Terapeut inexistent",
    text: "In modul demo, paginile se bazeaza pe ID-uri mock. Asigura-te ca URL-ul foloseste un ID existent (ex: /therapist/t1, /client/c1).",
  },
  {
    title: "Notitele si reflectiile nu apar",
    text: "Verifica daca clientul este legat de acel ID de terapeut in datele mock. In backend-ul real, asta devine o regula de permisiuni.",
  },
  {
    title: "Probleme de navigare pe mobil",
    text: "Daca dock-ul din dashboard se suprapune, putem ajusta spatierea si ordinea ca navbar-ul si sidebar-ul sa coexiste corect.",
  },
  {
    title: "Confidentialitate si limite",
    text: "Innery este conceput pentru spatii controlate de terapeut. Daca ai nevoie de un model diferit de vizibilitate pentru client, il putem defini.",
  },
];

export default function Topics() {
  return (
    <div className="mt-20">
      <div className="max-w-2xl">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900">
          Subiecte frecvente
        </h2>
        <p className="mt-2 text-sm md:text-base text-gray-600 leading-relaxed">
          Lucrurile care blocheaza de obicei progresul cand construiesti MVP-ul Innery.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {topics.map((t) => (
          <div
            key={t.title}
            className="rounded-2xl border border-(--color-soft) bg-white p-6 shadow-sm"
          >
            <p className="text-sm font-semibold text-gray-900">{t.title}</p>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">{t.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}