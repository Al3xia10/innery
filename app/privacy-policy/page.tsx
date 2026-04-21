import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <main className="bg-(--color-card)/40 min-h-screen">
      <section className="mx-auto max-w-4xl px-6 py-14 md:py-18">
        <article className="relative rounded-3xl border border-(--color-soft) bg-white p-6 shadow-sm md:p-10">
          <Link
            href="/"
            aria-label="Inchide si revino la homepage"
            className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-(--color-soft) bg-white text-gray-700 shadow-sm transition hover:bg-(--color-card)"
          >
            ×
          </Link>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-(--color-primary)">
            Legal
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-gray-900 md:text-3xl">
            Politica de confidentialitate
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Ultima actualizare: 21 aprilie 2026
          </p>

          <div className="mt-8 space-y-7 text-sm leading-7 text-gray-700">
            <section>
              <h2 className="text-base font-semibold text-gray-900">1. Cine suntem</h2>
              <p className="mt-2">
                Aceasta politica explica modul in care platforma Innery colecteaza, utilizeaza si protejeaza datele
                personale ale utilizatorilor (terapeuti si clienti). In sensul legislatiei aplicabile privind protectia
                datelor, Innery actioneaza ca operator de date pentru datele contului si ca persoana imputernicita in
                raport cu anumite date introduse de terapeuti in platforma.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900">2. Ce date colectam</h2>
              <p className="mt-2">
                Putem colecta: date de identificare (nume), date de contact (email), date de autentificare (parola
                hash-uita), date operationale din platforma (notite, sesiuni, obiective, progres), loguri tehnice
                (IP, browser, evenimente de securitate) si preferinte de utilizare.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900">3. Scopul prelucrarii</h2>
              <p className="mt-2">
                Prelucram datele pentru a furniza serviciul, pentru administrarea contului, autentificare, recuperare
                parola, securitate, suport tehnic, imbunatatirea produsului si respectarea obligatiilor legale.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900">4. Temeiuri legale</h2>
              <p className="mt-2">
                Prelucrarea se bazeaza pe executarea contractului (furnizarea serviciului), interes legitim
                (securitate, prevenirea abuzurilor, optimizare tehnica), consimtamant (unde este necesar) si
                obligatii legale.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900">5. Stocare si securitate</h2>
              <p className="mt-2">
                Aplicam masuri tehnice si organizatorice rezonabile pentru protejarea datelor, inclusiv control al
                accesului, parole hash-uite, audit intern si monitorizare. Nicio metoda de transmisie sau stocare nu
                este 100% sigura, dar lucram continuu pentru reducerea riscurilor.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900">6. Partajarea datelor</h2>
              <p className="mt-2">
                Nu vindem date personale. Putem partaja date cu furnizori de infrastructura (hosting, email,
                securitate, analytics minim), exclusiv in baza unor acorduri contractuale si numai in masura necesara
                furnizarii serviciului.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900">7. Perioada de retentie</h2>
              <p className="mt-2">
                Datele sunt pastrate cat timp contul este activ sau cat este necesar pentru scopurile declarate mai
                sus. Dupa inchiderea contului, anumite date pot fi pastrate pe perioade limitate pentru conformitate
                legala, audit si aparare juridica.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900">8. Drepturile tale</h2>
              <p className="mt-2">
                In functie de legislatia aplicabila, poti solicita acces la date, rectificare, stergere, restrictionare,
                opozitie, portabilitate si retragerea consimtamantului. Ai dreptul sa depui plangere la autoritatea
                competenta de protectie a datelor.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900">9. Date sensibile si rolul terapeutului</h2>
              <p className="mt-2">
                Platforma poate include informatii sensibile introduse in context terapeutic. Terapeutii sunt
                responsabili pentru modul in care colecteaza si gestioneaza continutul profesional conform obligatiilor
                lor etice si legale. Innery ofera infrastructura tehnica, nu servicii medicale.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900">10. Contact</h2>
              <p className="mt-2">
                Pentru intrebari legate de confidentialitate sau exercitarea drepturilor, ne poti contacta la:
                <a className="ml-1 font-medium text-(--color-accent) hover:underline" href="mailto:support@innery.com">
                  support@innery.com
                </a>
                .
              </p>
            </section>
          </div>
        </article>
      </section>
    </main>
  );
}
