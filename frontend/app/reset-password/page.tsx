'use client'

import { Suspense } from 'react' // ✅ PŘIDÁNO
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'
import { useToast } from '../contexts/ToastContext'
import '../styles/ResetPassword.scss'

const API_URL = process.env.NEXT_PUBLIC_API_URL

// ✅ PŘIDÁNO - Oddělíme komponentu která používá useSearchParams
function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const { showSuccess, showError } = useToast()

  // Password strength validation
  const passwordStrength = {
    hasLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
  }

  const isPasswordValid = passwordStrength.hasLength && passwordStrength.hasUppercase && passwordStrength.hasNumber
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0

  useEffect(() => {
    const tokenParam = searchParams?.get('token')
    if (tokenParam) {
      setToken(tokenParam)
    } else {
      setError('Chybí token pro obnovení hesla')
    }
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    
    if (!token) {
      setError('Chybí token pro obnovení hesla')
      return
    }

    if (!isPasswordValid) {
      setError('Heslo nesplňuje požadavky na sílu')
      return
    }

    if (!passwordsMatch) {
      setError('Hesla se neshodují')
      return
    }
    
    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token, 
          password 
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(true)
        showSuccess('Heslo změněno', 'Můžete se přihlásit s novým heslem')
        // Přesměruj na login po 3 sekundách
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } else {
        setError(data.message || 'Nepodařilo se změnit heslo')
        showError('Chyba', data.message || 'Nepodařilo se změnit heslo')
      }
    } catch (error) {
      console.error('Reset password error:', error)
      setError('Připojení selhalo')
      showError('Chyba sítě', 'Zkontrolujte internetové připojení')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="reset-password-page">
        <div className="reset-password-form">
          <div className="reset-password-form__success-state">
            <CheckCircle size={64} className="reset-password-form__success-icon" />
            <h2>Heslo bylo změněno!</h2>
            <p>
              Vaše heslo bylo úspěšně změněno. Nyní se můžete přihlásit s novým heslem.
            </p>
            <div className="reset-password-form__redirect-info">
              <p>Automaticky vás přesměrujeme na přihlašovací stránku...</p>
              <div className="reset-password-form__progress-bar">
                <div className="reset-password-form__progress-fill" />
              </div>
            </div>
            <Link href="/login" className="reset-password-form__primary-btn">
              Přihlásit se nyní
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="reset-password-page">
        <div className="reset-password-form">
          <div className="reset-password-form__error-state">
            <AlertCircle size={64} className="reset-password-form__error-icon" />
            <h2>Neplatný odkaz</h2>
            <p>
              Odkaz pro obnovení hesla je neplatný nebo chybí. 
              Zkuste požádat o nový odkaz.
            </p>
            <Link href="/forgot-password" className="reset-password-form__primary-btn">
              Požádat o nový odkaz
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="reset-password-page">
      <div className="reset-password-form">
        <div className="reset-password-form__header">
          <Link href="/login" className="reset-password-form__back">
            <ArrowLeft size={20} />
            Zpět na přihlášení
          </Link>
          <h1>Nastavte nové heslo</h1>
          <p>Zadejte nové bezpečné heslo pro váš účet.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="reset-password-form__field">
            <label htmlFor="password">Nové heslo</label>
            <div className="reset-password-form__input-wrap">
              <Lock size={20} className="reset-password-form__icon" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Nové heslo"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="new-password"
                minLength={8}
              />
              <button
                type="button"
                className="reset-password-form__eye"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            {/* Password strength indicators */}
            <div className="reset-password-form__password-strength">
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

          <div className="reset-password-form__field">
            <label htmlFor="confirmPassword">Potvrdit heslo</label>
            <div className="reset-password-form__input-wrap">
              <Lock size={20} className="reset-password-form__icon" />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                placeholder="Potvrdit nové heslo"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                autoComplete="new-password"
                minLength={8}
              />
              <button
                type="button"
                className="reset-password-form__eye"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            {/* Password match indicator */}
            {confirmPassword.length > 0 && (
              <div className={`reset-password-form__match-indicator ${passwordsMatch ? 'valid' : 'invalid'}`}>
                {passwordsMatch ? (
                  <><CheckCircle size={16} /> Hesla se shodují</>
                ) : (
                  <><AlertCircle size={16} /> Hesla se neshodují</>
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="reset-password-form__error">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading || !isPasswordValid || !passwordsMatch}
            className={`reset-password-form__submit ${isPasswordValid && passwordsMatch ? 'ready' : ''}`}
          >
            {loading ? (
              <>
                <div className="reset-password-form__spinner" />
                Měním heslo...
              </>
            ) : (
              <>
                <Lock size={18} />
                Změnit heslo
              </>
            )}
          </button>
        </form>

        <div className="reset-password-form__security">
          <h3>🔒 Bezpečnostní tipy</h3>
          <ul>
            <li>Použijte heslo, které nikde jinde nepoužíváte</li>
            <li>Kombinujte velká a malá písmena, čísla a symboly</li>
            <li>Heslo si nikde nezapisujte a nikomu ho nesdělujte</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

// ✅ PŘIDÁNO - Loading fallback komponenta
function ResetPasswordLoading() {
  return (
    <div className="reset-password-page">
      <div className="reset-password-form">
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <div className="reset-password-form__spinner" style={{ margin: '0 auto 20px' }} />
          <p>Načítání...</p>
        </div>
      </div>
    </div>
  )
}

// ✅ HLAVNÍ KOMPONENTA - zabalená v Suspense
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <ResetPasswordForm />
    </Suspense>
  )
}