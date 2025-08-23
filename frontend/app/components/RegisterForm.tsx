'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import '../styles/RegisterForm.scss'
import { ButtonLoading } from './LoadingStates'
import { useToast } from '../contexts/ToastContext'
import { Eye, EyeOff, User, Mail, Lock } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function RegisterForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordStrength, setPasswordStrength] = useState({
    hasLength: false,
    hasUppercase: false,
    hasNumber: false
  })
  const { showSuccess, showError } = useToast()

  useEffect(() => {
    setPasswordStrength({
      hasLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password)
    })
  }, [password])

  function isPasswordStrong() {
    return passwordStrength.hasLength && 
           passwordStrength.hasUppercase && 
           passwordStrength.hasNumber
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    if (!isPasswordStrong()) {
      setError('Heslo musí splňovat všechny požadavky')
      showError('Slabé heslo', 'Heslo musí mít alespoň 8 znaků, velké písmeno a číslo')
      return
    }
    setLoading(true)
    const form = e.currentTarget
    const email = form.email.value
    const name = form.name.value

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Registrace se nezdařila')
      }
      const data = await res.json()
      if (data.token) {
        localStorage.setItem('token', data.token)
        window.dispatchEvent(new CustomEvent('authChange', {
          detail: { isLoggedIn: true }
        }))
      }
      setSuccess(true)
      setLoading(false)
      showSuccess('Registrace úspěšná', `Vítejte, ${name}! Přesměrovávám na hlavní stránku...`)
      setTimeout(() => router.push('/'), 1000)
    } catch (err: any) {
      setError(err.message || 'Došlo k chybě při registraci')
      setLoading(false)
      showError('Chyba registrace', err.message || 'Došlo k chybě při registraci')
    }
  }

  return (
    <form className="register-form" onSubmit={handleSubmit} autoComplete="off">
      <h2>Registrace</h2>
      
      <div className="register-form__field">
        <label htmlFor="name">Jméno</label>
        <div className="register-form__input-wrap">
          <User size={20} className="register-form__icon" />
          <input 
            name="name" 
            id="name" 
            type="text" 
            required 
            placeholder="Jméno" 
            minLength={2}
            disabled={loading}
            autoComplete="name"
          />
        </div>
      </div>
      
      <div className="register-form__field">
        <label htmlFor="email">Email</label>
        <div className="register-form__input-wrap">
          <Mail size={20} className="register-form__icon" />
          <input 
            name="email" 
            id="email" 
            type="email" 
            required 
            placeholder="Email" 
            disabled={loading}
            autoComplete="email"
          />
        </div>
      </div>
      
      <div className="register-form__field">
        <label htmlFor="password">Heslo</label>
        <div className="register-form__input-wrap">
          <Lock size={20} className="register-form__icon" />
          <input
            name="password"
            id="password"
            type={showPassword ? 'text' : 'password'}
            required
            placeholder="Heslo"
            value={password}
            onChange={e => setPassword(e.target.value)}
            minLength={8}
            disabled={loading}
            autoComplete="new-password"
          />
          <button
            type="button"
            className="register-form__eye"
            tabIndex={-1}
            onClick={() => setShowPassword(v => !v)}
            aria-label={showPassword ? 'Skrýt heslo' : 'Zobrazit heslo'}
            disabled={loading}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <div className="register-form__password-strength">
          <div className={`strength-indicator ${passwordStrength.hasLength ? 'valid' : ''}`}>
            • Minimálně 8 znaků
          </div>
          <div className={`strength-indicator ${passwordStrength.hasUppercase ? 'valid' : ''}`}>
            • Jedno velké písmeno
          </div>
          <div className={`strength-indicator ${passwordStrength.hasNumber ? 'valid' : ''}`}>
            • Jedno číslo
          </div>
        </div>
      </div>
      
      <div className="register-form__terms">
        <label>
          <input
            type="checkbox"
            required
            name="terms"
            style={{ marginRight: 8 }}
            disabled={loading}
          />
          Souhlasím s&nbsp;
          <Link href="/terms" target="_blank">podmínkami užívání</Link>
        </label>
      </div>
      
      <button 
        type="submit" 
        disabled={loading || success}
        className={loading || success ? 'loading' : ''}
      >
        {loading ? (
          <>
            <ButtonLoading /> Registruji...
          </>
        ) : success ? (
          'Úspěšně registrováno!'
        ) : (
          'Registrovat'
        )}
      </button>
      
      <div className="register-form__switch">
        Máte účet? <Link href="/login">Přihlaste se zde</Link>
      </div>
      
      {error && <div className="register-form__error">{error}</div>}
      
      {success && (
        <div className="register-form__success">
          Registrace úspěšná, probíhá přesměrování…
          <div className="register-form__bar">
            <div className="register-form__bar-inner" style={{ animationDuration: '1s' }} />
          </div>
        </div>
      )}
    </form>
  )
}