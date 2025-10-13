'use client'
import React from 'react';
import { useRouter } from 'next/navigation'
import { PiggyBank, Zap, Users, Crown } from 'lucide-react'
import '../styles/QuickCategories.scss'

const quickCategories: { label: React.ReactNode; icon: React.ReactElement; query: QuickCategoryQuery }[] = [
  {
    label: (
      <>
        Auta do&nbsp;
        <span style={{ whiteSpace: 'nowrap' }}>50&nbsp;000&nbsp;Kč</span>
      </>
    ),
    icon: <PiggyBank color="#2563eb" size={38} strokeWidth={2.2} />,
    query: { priceTo: 50000, condition: 'used' }
  },
  {
    label: 'Elektromobily',
    icon: <Zap color="#22c55e" size={38} strokeWidth={2.2} />,
    query: { fuel: 'electric' }
  },
  {
    label: 'Rodinné',
    icon: <Users color="#f59e42" size={38} strokeWidth={2.2} />,
    query: { bodyType: 'kombi', seatCount: 5 }
  },
  {
    label: 'Luxusní',
    icon: <Crown color="#a855f7" size={38} strokeWidth={2.2} />,
    query: { priceFrom: 800000 }
  }
];

type QuickCategoryQuery = Record<string, string | number | boolean>;

export default function QuickCategories() {
  const router = useRouter();

  function handleQuickFilter(query: QuickCategoryQuery) {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, String(value));
      }
    });
    router.push(`/ads?${params.toString()}`);
  }

  return (
    <div className="home-page__quick-categories minimalist">
      {quickCategories.map((cat, idx) => (
        <button
          key={idx}
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