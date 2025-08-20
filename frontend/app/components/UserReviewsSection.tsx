import '../styles/components/UserReviewsSection.scss'

export default function UserReviewsSection() {
  return (
    <section className="user-reviews-section">
      <h2>Hodnocení uživatelů</h2>
      <div className="user-reviews-section__grid">
        <div className="user-reviews-section__item">
          <div className="user-reviews-section__avatar" style={{background:'#2563eb'}}>J</div>
          <div>
            <p>„Rychlé, přehledné, bez reklam. Auto jsem prodal za 3 dny!“</p>
            <span>Jan K., Praha</span>
          </div>
        </div>
        <div className="user-reviews-section__item">
          <div className="user-reviews-section__avatar" style={{background:'#22c55e'}}>M</div>
          <div>
            <p>„Super jednoduché vložení inzerátu. Doporučuji všem!“</p>
            <span>Marie S., Brno</span>
          </div>
        </div>
        <div className="user-reviews-section__item">
          <div className="user-reviews-section__avatar" style={{background:'#a855f7'}}>T</div>
          <div>
            <p>„Konečně inzertní web, kde mě nic neotravuje. Skvělá práce.“</p>
            <span>Tomáš V., Ostrava</span>
          </div>
        </div>
      </div>
    </section>
  );
}