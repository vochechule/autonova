'use client'
import '../styles/TermsPage.scss'

export default function PrivacyPage() {
  return (
    <main className="terms-page">
      <div className="terms-page__container">
        <h1>Zásady ochrany osobních údajů</h1>
        <p className="terms-page__intro">
          Ochrana vašich osobních údajů je pro nás důležitá. Tento dokument popisuje, jak portál Carta.cz
          zpracovává a chrání osobní údaje v souladu s platnou legislativou, zejména Nařízením Evropského parlamentu
          a Rady (EU) 2016/679 (GDPR).
        </p>

        <h2>1. Správce osobních údajů</h2>
        <ul>
          <li>Správcem osobních údajů je provozovatel portálu Carta.cz.</li>
          <li>Kontaktní údaje naleznete v sekci <i>Kontakt</i> na webu.</li>
        </ul>

        <h2>2. Rozsah zpracovávaných údajů</h2>
        <ul>
          <li>
            Zpracováváme údaje, které nám sami poskytnete při registraci, vkládání inzerátu nebo komunikaci
            s portálem (např. jméno, e-mail, telefon, obsah inzerátu).
          </li>
          <li>
            Technické údaje (např. IP adresa, cookies, informace o zařízení a prohlížeči) jsou zpracovávány
            pro zajištění provozu, zabezpečení a zlepšování portálu.
          </li>
        </ul>

        <h2>3. Účel a právní základ zpracování</h2>
        <ul>
          <li>Vaše údaje zpracováváme za účelem umožnění registrace, správy účtu a zveřejnění inzerátů.</li>
          <li>Údaje využíváme také pro komunikaci mezi uživateli a s podporou portálu.</li>
          <li>
            Na základě oprávněného zájmu můžeme údaje použít pro zlepšování služeb, analýzu provozu
            a marketing (např. propagace inzerátů).
          </li>
          <li>V případě placených služeb je právním základem plnění smlouvy.</li>
        </ul>

        <h2>4. Předávání údajů třetím stranám</h2>
        <ul>
          <li>
            Osobní údaje nepředáváme třetím stranám bez vašeho souhlasu, vyjma případů, kdy je to vyžadováno zákonem.
          </li>
          <li>
            V případě placených služeb mohou být údaje poskytnuty poskytovatelům platebních služeb
            (např. bankám, platebním bránám).
          </li>
          <li>
            Technické údaje mohou být zpracovávány poskytovateli hostingových a analytických služeb
            (např. pro provoz serverů nebo měření návštěvnosti).
          </li>
        </ul>

        <h2>5. Cookies</h2>
        <ul>
          <li>
            Portál používá cookies pro správné fungování, personalizaci obsahu a analýzu návštěvnosti.
          </li>
          <li>
            Používáním portálu souhlasíte s ukládáním cookies do vašeho zařízení. V nastavení prohlížeče
            můžete jejich používání omezit nebo zablokovat.
          </li>
        </ul>

        <h2>6. Doba uchovávání údajů</h2>
        <ul>
          <li>
            Údaje uchováváme pouze po dobu nezbytnou k naplnění účelu zpracování, nejdéle však po dobu existence
            uživatelského účtu.
          </li>
          <li>
            Po zrušení účtu nebo na vaši žádost budou údaje smazány, pokud jejich další uchování nevyžaduje zákon.
          </li>
        </ul>

        <h2>7. Práva uživatelů</h2>
        <ul>
          <li>Máte právo na přístup k osobním údajům, jejich opravu nebo výmaz.</li>
          <li>Můžete požadovat omezení zpracování a využít právo na přenositelnost údajů.</li>
          <li>Máte právo vznést námitku proti zpracování založenému na oprávněném zájmu.</li>
          <li>Máte právo podat stížnost u Úřadu pro ochranu osobních údajů (www.uoou.cz).</li>
        </ul>

        <h2>8. Zabezpečení údajů</h2>
        <ul>
          <li>
            Přijímáme technická a organizační opatření k ochraně údajů před ztrátou, zneužitím
            nebo neoprávněným přístupem.
          </li>
        </ul>

        <h2>9. Závěrečná ustanovení</h2>
        <ul>
          <li>
            Tyto zásady mohou být aktualizovány. Aktuální verze je vždy dostupná na portálu.
          </li>
          <li>
            V případě dotazů nás můžete kontaktovat prostřednictvím kontaktního formuláře nebo na e-mail uvedený v sekci <i>Kontakt</i>.
          </li>
        </ul>

        
      </div>
    </main>
  )
}
