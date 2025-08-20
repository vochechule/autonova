import { CheckCircle, Zap, Shield, Smile } from 'lucide-react';
import '../styles/components/WhyCartaSection.scss'


export default function WhyCartaSection() {
  return (
    <section className="why-carta-section">
      <h2>Proč zrovna Carta.cz?</h2>
      <div className="why-carta-section__grid">
        <div className="why-carta-section__item">
          <CheckCircle size={36} color="#2563eb" />
          <h3>Inzerce zdarma</h3>
          <p>Žádné poplatky za vložení nebo správu inzerátu. Prodej i nákup bez omezení.</p>
        </div>
        <div className="why-carta-section__item">
          <Zap size={36} color="#22c55e" />
          <h3>Rychlost a jednoduchost</h3>
          <p>Inzerát přidáte během minuty. Moderní rozhraní bez zbytečných kroků a reklam.</p>
        </div>
        <div className="why-carta-section__item">
          <Shield size={36} color="#f59e42" />
          <h3>Bezpečí a soukromí</h3>
          <p>Vaše data chráníme a nikdy je neprodáváme třetím stranám. Komunikace je bezpečná.</p>
        </div>
        <div className="why-carta-section__item">
          <Smile size={36} color="#a855f7" />
          <h3>Přehlednost</h3>
          <p>Žádné bannery, žádné matoucí nabídky. Jen auta a uživatelé.</p>
        </div>
      </div>
    </section>
  );
}