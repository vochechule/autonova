import "../styles/AboutPage.scss";
import ContactForm from "../components/ContactForm";

export default function AboutPage() {
  return (
    <main className="about-page">
      <div className="about-page__container">
        <h1>O projektu</h1>
        <p className="about-page__intro">
          Hledání auta na internetu by mělo být jednoduché, rychlé a férové. Už nás nebavilo probírat se desítkami neaktuálních inzerátů, řešit jen velmi omezené možnosti filtrování a ještě k tomu platit poplatky za samotné přidání inzerátu. Proto jsme vytvořili platformu, která nabízí čistý a přehledný způsob, jak auta kupovat a prodávat – zdarma a bez zbytečných překážek.        </p>
        <p className="about-page__intro">
          I když projekt začal jako maturitní práce, od začátku ho stavíme tak, aby měl smysl i v praxi. Naším cílem je vybudovat prostředí, které bude dávat uživatelům skutečnou hodnotu – ať už jste soukromý prodejce, nebo autobazar.
        </p>

        <section className="about-page__section">
          <h2>Náš tým</h2>
          <p>
            Jsme malý tým s velkým nadšením. Díky tomu se můžeme soustředit na detaily, rychle reagovat na zpětnou vazbu a neustále posouvat platformu dopředu. Naše práce stojí na tom, že nasloucháme uživatelům a podle jejich potřeb zlepšujeme každou část aplikace.
          </p>
        </section>

        <section className="about-page__section">
          <h2>Naše hodnoty</h2>
          <ul className="about-page__values">
            <li>
              <strong>Transparentnost</strong> – všechno má být jasné a férové.
            </li>
            <li>
              <strong>Dostupnost</strong> – nákup a prodej aut má být pro všechny zdarma.
            </li>
            <li>
              <strong>Kvalita</strong> – zaměřujeme se na to, aby každý detail fungoval spolehlivě.
            </li>
          </ul>
        </section>

        <section className="about-page__section">
          <h2>Naše vize</h2>
          <p>
            Tímhle projektem to nekončí. Chceme platformu dál rozvíjet, přidávat nové funkce a rozšiřovat možnosti vyhledávání i prezentace inzerátů. Naším cílem je vytvořit místo, kde bude prodej a nákup aut co nejjednodušší, a kde se budou lidé rádi vracet – nejen kvůli nabídce, ale i kvůli celkovému zážitku.
          </p>
        </section>

        <section className="about-page__section">
          <h2>Vaše zpětná vazba</h2>
          <p>
            Budeme rádi za jakoukoli zpětnou vazbu – ať už jde o nápad na novou funkci, návrh na vylepšení nebo připomínku k tomu, co by mohlo fungovat lépe. Každý podnět nám pomáhá posouvat platformu dál a dělá z ní místo, které odpovídá skutečným potřebám uživatelů.
          </p>
          <div style={{ marginTop: "2rem" }}>
            <ContactForm
              title="Dejte nám vědět, co byste vylepšili"
              description="Napište nám svůj nápad, připomínku nebo cokoliv, co by vám na stránce chybělo. Každý podnět nám pomáhá zlepšovat platformu pro všechny."
              buttonText="Odeslat zpětnou vazbu"
              successMessage="Děkujeme za vaši zpětnou vazbu! 👍"
              placeholder="Vaše zpráva, nápad nebo připomínka"
            />
          </div>
        </section>
      </div>
    </main>
  );
}