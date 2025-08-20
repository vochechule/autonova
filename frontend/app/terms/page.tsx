'use client'
import '../styles/TermsPage.scss'

export default function TermsPage() {
  return (
    <main className="terms-page">
      <div className="terms-page__container">
        <h1>Podmínky užívání portálu Carta.cz</h1>
        <p className="terms-page__intro">
          Používáním portálu Carta.cz souhlasíte s níže uvedenými podmínkami.
        </p>

        <h2>1. Obecné informace</h2>
        <ul>
          <li>Carta.cz je inzertní portál pro soukromou i firemní inzerci vozidel.</li>
          <li>Provozovatel není prodejcem vozidel a neručí za pravdivost údajů v inzerátech ani za kvalitu či stav prodávaných vozidel.</li>
          <li>Provozovatel neposkytuje žádnou záruku na průběh obchodních transakcí mezi uživateli a neodpovídá za případné škody či ztráty vzniklé jejich užíváním.</li>
        </ul>

        <h2>2. Vkládání inzerátů</h2>
        <ul>
          <li>Uživatel odpovídá za pravdivost, aktuálnost a zákonnost údajů uvedených v inzerátu.</li>
          <li>Je zakázáno vkládat inzeráty obsahující nepravdivé, klamavé nebo nelegální informace, porušující autorská práva či práva třetích osob.</li>
          <li>Provozovatel si vyhrazuje právo kdykoliv inzerát upravit nebo odstranit, pokud porušuje tyto podmínky nebo platné právní předpisy.</li>
          <li>Životnost inzerátu je standardně 3 měsíce, poté může být skryt nebo smazán, pokud uživatel neprodlouží jeho platnost.</li>
          <li>Nahráním inzerátu uživatel souhlasí s jeho případným použitím pro marketingové účely portálu (např. propagace na sociálních sítích, v reklamě apod.).</li>
        </ul>

        <h2>3. Ochrana osobních údajů</h2>
        <ul>
          <li>Osobní údaje jsou zpracovávány pouze za účelem provozu portálu v souladu s platnými právními předpisy.</li>
          <li>Údaje nejsou poskytovány třetím stranám bez souhlasu uživatele, vyjma zákonných povinností.</li>
          <li>Podrobnosti o zpracování osobních údajů jsou uvedeny v samostatném dokumentu <i>Zásady ochrany osobních údajů</i>.</li>
        </ul>

        <h2>4. Placené služby</h2>
        <ul>
          <li>Některé služby portálu mohou být zpoplatněny (např. zvýraznění inzerátu, topování apod.).</li>
          <li>Aktuální ceny a podmínky placených služeb budou vždy uvedeny přímo v rozhraní portálu.</li>
          <li>Provozovatel si vyhrazuje právo kdykoliv měnit ceny a rozsah placených služeb.</li>
        </ul>

        <h2>5. Omezení odpovědnosti</h2>
        <ul>
          <li>Provozovatel neodpovídá za obsah inzerátů, jejich úplnost ani za průběh obchodních jednání mezi uživateli.</li>
          <li>Používání portálu probíhá na vlastní riziko uživatele.</li>
        </ul>

        <h2>6. Závěrečná ustanovení</h2>
        <ul>
          <li>Provozovatel si vyhrazuje právo tyto podmínky kdykoliv změnit. Aktuální verze podmínek je vždy dostupná na portálu.</li>
          <li>Používáním portálu uživatel souhlasí s těmito podmínkami.</li>
        </ul>

      </div>
    </main>
  )
}
