import "../styles/AboutPage.scss";

export default function AboutPage() {
  return (
    <main className="about-page">
      <div className="about-page__container">
        <h1>O projektu</h1>
        <p className="about-page__intro">
          Už nás nebavilo prohledávat desítky inzerátů na neefektivních webech a platit za něco, co by mělo být zdarma. Proto jsme se rozhodli vytvořit platformu, která nabídne lepší a férovější zážitek pro každého, ať už jste soukromá osoba nebo prodejce. Tento projekt vznikl jako maturitní práce, ale věříme, že z něj může vzniknout reálně užitečná platforma pro nákup a prodej aut. Naším cílem je vytvořit místo, kde bude vše **rychlé, přehledné a zdarma**.
        </p>

        <section className="about-page__section">
          <h2>Náš tým</h2>
          <p>
            Jsme malý, ale dynamický tým, který pracuje s nadšením a cílem vytvořit platformu, která opravdu funguje pro všechny. Díky tomu, že jsme malý tým, můžeme rychle reagovat na zpětnou vazbu a neustále zlepšovat každý detail naší platformy, aby fungovala hladce a spolehlivě.
          </p>
        </section>

        <section className="about-page__section">
          <h2>Naše hodnoty</h2>
          <ul className="about-page__values">
            <li>
              <strong>Transparentnost</strong> – Chceme, aby vše bylo jasné a férové.
            </li>
            <li>
              <strong>Dostupnost</strong> – Nákup a prodej auta by měl být zdarma pro všechny.
            </li>
            <li>
              <strong>Kvalita</strong> – Každý detail platformy řešíme tak, aby fungoval bez problémů.
            </li>
          </ul>
        </section>

        <section className="about-page__section">
          <h2>Financování a podpora projektu</h2>
          <p>
            Jsme velmi malý tým a projekt je zatím prodělečný, financujeme ho z vlastní kapsy. Jakýkoli příspěvek nám pomůže s provozními náklady.
          </p>
          <div className="about-page__support">
            <h3>Kam jdou moje peníze?</h3>
            <p>
              Veškeré příspěvky půjdou přímo na **provoz a rozvoj platformy**. Konkrétně nám pomůžete pokrýt náklady na:
            </p>
            <ul>
              <li><strong>Hosting</strong> – aby platforma běžela rychle a spolehlivě.</li>
              <li><strong>Doménu</strong> – aby byl web pro uživatele snadno dostupný.</li>
              <li><strong>Marketing</strong> – abychom oslovili více lidí.</li>
              <li><strong>Další rozvoj</strong> – abychom mohli neustále přidávat nové funkce.</li>
            </ul>
          </div>
          <p>
            Pokud nás chcete podpořit, napište nám na e-mail{" "}
            <a href="mailto:info@carta.cz">info@carta.cz</a> a domluvíme se. Každý podporovatel bude umístěn v naší síni slávy na stránce projektu.
          </p>
        </section>
      </div>
    </main>
  );
}