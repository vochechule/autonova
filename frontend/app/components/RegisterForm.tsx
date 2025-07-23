'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import '../styles/LoginForm.scss'

export default function RegisterForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState('')

  function isPasswordStrong(pw: string) {
    return pw.length >= 8 && /[A-Z]/.test(pw) && /[0-9]/.test(pw)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    if (!isPasswordStrong(password)) {
      setError('Heslo musí mít alespoň 8 znaků, jedno velké písmeno a číslo.')
      return
    }
    setLoading(true)
    const form = e.currentTarget
    const email = form.email.value
    const name = form.name.value

    try {
      const res = await fetch('http://localhost:3000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      })
      if (!res.ok) throw new Error('Registrace se nezdařila')
      setSuccess(true)
      setLoading(false)
      setTimeout(() => router.push('/'), 1000)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <h2>Registrace</h2>
      <label htmlFor="name">Jméno</label>
      <input name="name" id="name" type="text" required placeholder="Jméno" />
      <label htmlFor="email">Email</label>
      <input name="email" id="email" type="email" required placeholder="Email" />
      <label htmlFor="password">Heslo</label>
      <div className="login-form__password-wrap">
        <input
          name="password"
          id="password"
          type={showPassword ? 'text' : 'password'}
          required
          placeholder="Heslo"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button
          type="button"
          className="login-form__eye"
          tabIndex={-1}
          onClick={() => setShowPassword(v => !v)}
          aria-label={showPassword ? 'Skrýt heslo' : 'Zobrazit heslo'}
        >
          {showPassword ? '👁️' : '👁'}
        </button>
      </div>
      <div className="login-form__password-hint">
        Heslo musí mít alespoň 8 znaků, jedno velké písmeno a číslo.
      </div>
      <button type="submit" disabled={loading || success}>
        {loading ? 'Registruji...' : 'Registrovat'}
      </button>
      <div className="login-form__switch">
        Máte účet? <Link href="/login">Přihlaste se zde</Link>
      </div>
      {error && <div className="login-form__error">{error}</div>}
      {success && (
        <div className="login-form__success">
          Registrace úspěšná, probíhá přesměrování…
          <div className="login-form__bar">
            <div className="login-form__bar-inner" style={{ animationDuration: '1s' }} />
          </div>
        </div>
      )}
    </form>
  )
}