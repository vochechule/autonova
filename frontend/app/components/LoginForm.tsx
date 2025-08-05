'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import '../styles/LoginForm.scss'

export default function LoginForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const form = e.currentTarget
    const email = form.email.value
    const password = form.password.value

    try {
      const res = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      
      if (!res.ok) throw new Error('Přihlášení se nezdařilo')
      
      const data = await res.json()
      console.log('Login response:', data) // Debug log
      
      // ZMĚNA: data.token místo data.access_token
      localStorage.setItem('token', data.token)
      
      // Poslat event pro aktualizaci headeru
      window.dispatchEvent(new Event('loginStatusChanged'))
      
      setSuccess(true)
      setLoading(false)
      setTimeout(() => router.push('/'), 1000) // Počkej 1s a přesměruj
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <h2>Přihlášení</h2>
      <label htmlFor="email">Email</label>
      <input name="email" id="email" type="email" required placeholder="Email" />
      <label htmlFor="password">Heslo</label>
      <input name="password" id="password" type="password" required placeholder="Heslo" />
      <button type="submit" disabled={loading || success}>
        {loading ? 'Přihlašuji...' : 'Přihlásit se'}
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