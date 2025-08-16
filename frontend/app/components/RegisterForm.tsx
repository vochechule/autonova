'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import '../styles/LoginForm.scss'
// ✅ PŘIDÁNO - Loading states a toast
import { ButtonLoading } from './LoadingStates'
import { useToast } from '../contexts/ToastContext'

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
  // ✅ PŘIDÁNO - Toast hook
  const { showSuccess, showError, showInfo } = useToast()

  // Update password strength indicators in real-time
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
      // ✅ PŘIDÁNO - Toast pro slabé heslo
      showError('Slabé heslo', 'Heslo musí mít alespoň 8 znaků, velké písmeno a číslo')
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
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Registrace se nezdařila')
      }
      
      const data = await res.json()
      
      // Save token and update auth state
      if (data.token) {
        localStorage.setItem('token', data.token)
        
        // Dispatch custom event to notify Header about auth change
        window.dispatchEvent(new CustomEvent('authChange', {
          detail: { isLoggedIn: true }
        }))
      }
      
      setSuccess(true)
      setLoading(false)
      
      // ✅ PŘIDÁNO - Toast po úspěšné registraci
      showSuccess('Registrace úspěšná', `Vítejte, ${name}! Přesměrovávám na hlavní stránku...`)
      
      setTimeout(() => router.push('/'), 1000)
    } catch (err: any) {
      setError(err.message || 'Došlo k chybě při registraci')
      setLoading(false)
      
      // ✅ PŘIDÁNO - Toast pro chybu registrace
      showError('Chyba registrace', err.message || 'Došlo k chybě při registraci')
    }
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <h2>Registrace</h2>
      
      <label htmlFor="name">Jméno</label>
      <input 
        name="name" 
        id="name" 
        type="text" 
        required 
        placeholder="Jméno" 
        minLength={2}
        disabled={loading}
      />
      
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
      <div className="login-form__password-wrap">
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
        />
        <button
          type="button"
          className="login-form__eye"
          tabIndex={-1}
          onClick={() => setShowPassword(v => !v)}
          aria-label={showPassword ? 'Skrýt heslo' : 'Zobrazit heslo'}
          disabled={loading}
        >
          {showPassword ? '👁️' : '👁'}
        </button>
      </div>
      
      <div className="login-form__password-strength">
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