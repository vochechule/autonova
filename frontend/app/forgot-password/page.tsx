'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowLeft, CheckCircle, AlertCircle, MessageCircle } from 'lucide-react'
import { useToast } from '../contexts/ToastContext' // ✅ OPRAVENO - správný import
import ContactForm from '../components/ContactForm'
import '../styles/ForgotPassword.scss'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [showContactForm, setShowContactForm] = useState(false)
  const { showSuccess, showError } = useToast()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    
    if (!email || !email.includes('@')) {
      setError('Zadejte platný email')
      return
    }
    
    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(true)
        showSuccess('Email odeslán', 'Zkontrolujte svou emailovou schránku')
      } else {
        setError(data.message || 'Nepodařilo se odeslat email')
        showError('Chyba', data.message || 'Nepodařilo se odeslat email')
      }
    } catch (error) { // ✅ OPRAVENO - používáme error parametr
      console.error('Forgot password error:', error)
      setError('Připojení selhalo')
      showError('Chyba sítě', 'Zkontrolujte internetové připojení')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="forgot-password-page">
        <div className="forgot-password-form">
          <div className="forgot-password-form__success-state">
            <CheckCircle size={64} className="forgot-password-form__success-icon" />
            <h2>Email byl odeslán!</h2>
            <p>
              Pokud email <strong>{email}</strong> existuje v našem systému, 
              poslali jsme vám instrukce pro obnovení hesla.
            </p>
            <div className="forgot-password-form__success-tips">
              <h3>Nevidíte email?</h3>
              <ul>
                <li>Zkontrolujte složku spam/nevyžádaná pošta</li>
                <li>Email může přijít až za několik minut</li>
                <li>Ověřte, že jste zadali správný email</li>
              </ul>
            </div>
            <div className="forgot-password-form__actions">
              <button 
                onClick={() => setSuccess(false)}
                className="forgot-password-form__secondary-btn"
              >
                Zkusit jiný email
              </button>
              <Link href="/login" className="forgot-password-form__primary-btn">
                Zpět na přihlášení
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-form">
        <div className="forgot-password-form__header">
          <Link href="/login" className="forgot-password-form__back">
            <ArrowLeft size={20} />
            Zpět na přihlášení
          </Link>
          <h1>Zapomněli jste heslo?</h1>
          <p>Zadejte svůj email a pošleme vám instrukce pro obnovení hesla.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="forgot-password-form__field">
            <label htmlFor="email">Email</label>
            <div className="forgot-password-form__input-wrap">
              <Mail size={20} className="forgot-password-form__icon" />
              <input
                id="email"
                type="email"
                required
                placeholder="vas-email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
                autoFocus
              />
            </div>
          </div>

          {error && (
            <div className="forgot-password-form__error">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}>
            {loading ? (
              <>
                {/* ✅ OPRAVENO - jednoduchý loading text místo ButtonLoading komponentu */}
                <div className="forgot-password-form__spinner" />
                Odesílám...
              </>
            ) : (
              <>
                <Mail size={18} />
                Odeslat instrukce
              </>
            )}
          </button>
        </form>

        <div className="forgot-password-form__help">
          <h3>Potřebujete pomoc?</h3>
          <p>
            Pokud máte problémy s obnovením hesla, můžete nás kontaktovat přímo.
          </p>
          <button 
            type="button"
            className="forgot-password-form__contact-btn"
            onClick={() => setShowContactForm(!showContactForm)}
          >
            <MessageCircle size={18} />
            {showContactForm ? 'Skrýt kontaktní formulář' : 'Kontaktovat podporu'}
          </button>
          
          {showContactForm && (
            <div className="forgot-password-form__contact-form">
              <ContactForm
                title="Kontaktujte naši podporu"
                description="Popište nám váš problém s obnovením hesla a my vám pomůžeme."
                buttonText="Odeslat dotaz"
                successMessage="Děkujeme! Odpovíme vám co nejdříve. 📧"
                placeholder="Popište váš problém s obnovením hesla..."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}