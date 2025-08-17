'use client'
import { useRouter } from 'next/navigation'
import '../styles/QuickCategories.scss'

const quickCategories = [
  {
    label: 'Auta do 50 000 Kč',
    image: '/quick-50k.webp',
    query: { priceTo: 50000, condition: 'used' },
    loading: "lazy"
  },
  {
    label: 'Elektromobily',
    image: '/quick-electric.webp',
    query: { fuel: 'electric' },
    loading: "lazy"
  },
  {
    label: 'Rodinné',
    image: '/quick-family.webp',
    query: {  bodytype: 'kombi', seatCountFrom: 5 },
    loading: "lazy"
  },
  {
    label: 'Luxusní',
    image: '/quick-luxury.webp',
    query: { priceFrom: 800000 },
    loading: "lazy"
  }
];

export default function QuickCategories() {
  const router = useRouter();

  function handleQuickFilter(query: Record<string, any>) {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => params.append('bodyType', v));
      } else {
        params.append(key, String(value));
      }
    });
    router.push(`/ads?${params.toString()}`);
  }

  return (
    <div className="home-page__quick-categories">
      {quickCategories.map(cat => (
        <button
          key={cat.label}
          className="home-page__quick-btn"
          onClick={() => handleQuickFilter(cat.query)}
        >
          <img 
            src={cat.image} 
            alt={cat.label} 
            className="home-page__quick-img"
            loading={cat.loading as "lazy" | "eager"}
          />
          <span className="quick-category-text">{cat.label}</span>
        </button>
      ))}
    </div>
  );
}