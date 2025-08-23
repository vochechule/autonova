'use client'
import { useRouter } from 'next/navigation'
import '../styles/QuickCategories.scss'

const quickCategories = [
  {
    label: 'Auta do 50 000 Kč',
    icon: (
      // Lucide: PiggyBank
      <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
        <path d="M5 11c-1.657 0-3 1.343-3 3s1.343 3 3 3h1v2a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-2h1c1.657 0 3-1.343 3-3s-1.343-3-3-3" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <ellipse cx="12" cy="11" rx="7" ry="5" stroke="#2563eb" strokeWidth="2"/>
        <circle cx="16" cy="9" r="1" fill="#2563eb"/>
      </svg>
    ),
    query: { priceTo: 50000, condition: 'used' }
  },
  {
    label: 'Elektromobily',
    icon: (
      // Lucide: Zap
      <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </svg>
    ),
    query: { fuel: 'electric' }
  },
  {
    label: 'Rodinné',
    icon: (
      // Lucide: Users
      <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
        <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" stroke="#f59e42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="9" cy="7" r="4" stroke="#f59e42" strokeWidth="2"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="#f59e42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="#f59e42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    query: { bodyType: 'kombi', seatCount: 5 }
  },
  {
    label: 'Luxusní',
    icon: (
      // Lucide: Crown
      <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
        <path d="M2 19h20M2 8l5 5 5-9 5 9 5-5" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 19a4 4 0 0 1-8 0" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    query: { priceFrom: 800000 }
  }
];

type QuickCategoryQuery = Record<string, string | number | boolean>;

export default function QuickCategories() {
  const router = useRouter();

  function handleQuickFilter(query: QuickCategoryQuery) {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      params.append(key, String(value));
    });
    router.push(`/ads?${params.toString()}`);
  }

  return (
    <div className="home-page__quick-categories minimalist">
      {quickCategories.map(cat => (
        <button
          key={cat.label}
          className="home-page__quick-btn minimalist"
          onClick={() => handleQuickFilter(cat.query)}
        >
          <span className="quick-category-icon">{cat.icon}</span>
          <span className="quick-category-text">{cat.label}</span>
        </button>
      ))}
    </div>
  );
}