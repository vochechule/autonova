import Link from "next/link";
import { ArrowRightCircle } from "lucide-react";
import "../styles/components/SellCarCTA.scss";

export default function SellCarCTA() {
  return (
    <section className="sell-car-cta">
      <div className="sell-car-cta__content">
        <h2>Chcete prodat své auto?</h2>
        <p>
          Přidejte inzerát zdarma během minuty. Bez poplatků, bez reklam, jen skuteční zájemci.
        </p>
        <Link href="/ads/create" className="sell-car-cta__button">
          Přidat inzerát <ArrowRightCircle size={22} />
        </Link>
        <p className="sell-car-cta__note">
          Pro přidání inzerátu je nutné být přihlášený.
        </p>
      </div>
    </section>
  );
}