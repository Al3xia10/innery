import Link from "next/link";

const actions = [
  {
    eyebrow: "Terapeuti",
    title: "Invita un client",
    text: "Creeaza un spatiu de client si partajeaza accesul (flux MVP: link mock/invitatie).",
    href: "/for-therapists",
    cta: "Deschide ghidul terapeutului →",
  },
  {
    eyebrow: "Clienti",
    title: "Acceseaza-ti spatiul",
    text: "Daca nu poti deschide dashboard-ul, verifica linkul si ID-ul de client (demo).",
    href: "/for-clients",
    cta: "Deschide ghidul clientului →",
  },
  {
    eyebrow: "Cont",
    title: "Probleme de autentificare",
    text: "Redirect gresit, ID lipsa sau 'not found'? Te ajutam sa depanezi rapid.",
    href: "/auth/login",
    cta: "Mergi la autentificare →",
  },
];

export default function QuickActions() {
  return (
    <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
      {actions.map((a) => (
        <div
          key={a.title}
          className="rounded-2xl border border-(--color-soft) bg-white p-6 shadow-sm"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-(--color-primary)">
            {a.eyebrow}
          </p>

          <p className="mt-2 text-sm font-semibold text-gray-900">{a.title}</p>

          <p className="mt-2 text-sm text-gray-600 leading-relaxed">{a.text}</p>

          <Link
            href={a.href}
            className="mt-4 inline-flex text-sm font-semibold text-(--color-accent) hover:opacity-90"
          >
            {a.cta}
          </Link>
        </div>
      ))}
    </div>
  );
}