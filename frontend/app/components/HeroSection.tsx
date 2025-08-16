'use client'
import { useState, useEffect } from 'react'
import '../styles/components/HeroSection.scss'

export default function HeroSection() {
  // Alternative s typing effect:
  const [currentText, setCurrentText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const texts = ['jednoduše', 'bez reklam', 'zdarma']
    const current = texts[currentIndex]
    
    if (!isDeleting && currentText === current) {
      setTimeout(() => setIsDeleting(true), 2000)
    } else if (isDeleting && currentText === '') {
      setIsDeleting(false)
      setCurrentIndex((prev) => (prev + 1) % texts.length)
    } else {
      const timeout = setTimeout(() => {
        setCurrentText(prev => 
          isDeleting 
            ? prev.slice(0, -1)
            : current.slice(0, prev.length + 1)
        )
      }, isDeleting ? 50 : 100)
      
      return () => clearTimeout(timeout)
    }
  }, [currentText, currentIndex, isDeleting])

  return (
    <section className="hero-section">
      <div className="hero-section__container">
        <h1 className="hero-section__title">
          <span className="hero-section__brand">Carta.cz</span>
          <span className="hero-section__separator"> - </span>
          <span className="hero-section__description">prodej a koupě aut </span>
          <span className="hero-section__rotating-text">
            {currentText}
          </span>
        </h1>
        
        <p className="hero-section__subtitle">
          Nejlepší místo pro nákup a prodej ojetých vozů v České republice
        </p>
      </div>
    </section>
  )
}
