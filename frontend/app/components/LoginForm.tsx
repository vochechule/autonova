'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import '../styles/LoginForm.scss'
// ✅ PŘIDÁNO - Loading states a toast
import { ButtonLoading } from './LoadingStates'
import { useToast } from '../contexts/ToastContext'

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function LoginForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // ✅ PŘIDÁNO - Toast hook
  const { showSuccess, showError, showInfo } = useToast()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const form = e.currentTarget
    const email = form.email.value
    const password = form.password.value

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        const errorMessage = errorData.message || 'Přihlášení se nezdařilo'
        throw new Error(errorMessage)
      }
      
      const data = await res.json()
      
      // ZMĚNA: data.token místo data.access_token
      localStorage.setItem('token', data.token)
      
      // Poslat event pro aktualizaci headeru
      window.dispatchEvent(new Event('loginStatusChanged'))
      
      setSuccess(true)
      setLoading(false)
      
      // ✅ PŘIDÁNO - Toast po úspěšném přihlášení
      showSuccess('Přihlášení úspěšné', 'Vítejte zpět! Přesměrovávám na hlavní stránku...')
      
      setTimeout(() => router.push('/'), 1000) // Počkej 1s a přesměruj
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
      
      // ✅ PŘIDÁNO - Toast pro chybu přihlášení
      if (err.message.includes('Unauthorized') || err.message.includes('Invalid credentials')) {
        showError('Neplatné údaje', 'Email nebo heslo není správné')
      } else {
        showError('Chyba přihlášení', err.message)
      }
    }
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <h2>Přihlášení</h2>
      <label htmlFor="email">Email</label>
      <input 
        name="email" 
        id="email" 
        type="email" 
        required 
        placeholder="Email" 
        disabled={loading}
      />
      <label htmlFor="password">Heslo</label>
      <input 
        name="password" 
        id="password" 
        type="password" 
        required 
        placeholder="Heslo" 
        disabled={loading}
      />
      <button type="submit" disabled={loading || success}>
        {loading ? (
          <>
            <ButtonLoading /> Přihlašuji...
          </>
        ) : success ? (
          'Přihlášení úspěšné!'
        ) : (
          'Přihlásit se'
        )}
      </button>
      {error && <div className="login-form__error">{error}</div>}
      {success && (
        <div className="login-form__success">
          Přihlášení úspěšné, probíhá přesměrování…
          <div className="login-form__bar">
            <div className="login-form__bar-inner" style={{ animationDuration: '1s' }} />
          </div>
        </div>
      )}
      <div className="login-form__switch">
        Nemáte účet? <Link href="/register">Zaregistrujte se zde</Link>
      </div>
    </form>
  )
}