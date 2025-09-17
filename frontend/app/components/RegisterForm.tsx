'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import '../styles/RegisterForm.scss'
import { ButtonLoading } from './LoadingStates'
import { useToast } from '../contexts/ToastContext'
import { Eye, EyeOff, User, Mail, Lock } from 'lucide-react'
import { useAuth } from '../hooks/AuthProvider'

const API_URL = process.env.NEXT_PUBLIC_API_URL

// ✅ Define proper error types
interface ApiError {
  code?: string
  message?: string
  statusCode?: number
}

// ✅ Registration-specific error messages
const REGISTER_ERROR_MESSAGES = {
  'EMAIL_ALREADY_EXISTS': 'Email se již používá',
  'EMAIL_TAKEN': 'Email se již používá',
  'WEAK_PASSWORD': 'Heslo je příliš slabé',
  'INVALID_EMAIL': 'Neplatný formát emailu',
  'INVALID_NAME': 'Jméno musí mít alespoň 2 znaky',
  'NAME_TOO_SHORT': 'Jméno je příliš krátké',
  'NAME_TOO_LONG': 'Jméno je příliš dlouhé',
  'PASSWORD_TOO_SHORT': 'Heslo musí mít alespoň 8 znaků',
  'VALIDATION_ERROR': 'Neplatné údaje',
  'NETWORK_ERROR': 'Problém se sítí, zkuste to znovu',
  'SERVER_ERROR': 'Problém se serverem, zkuste to později',
  'RATE_LIMIT': 'Příliš mnoho pokusů, zkuste to později'
} as const

function getRegisterErrorMessage(error: unknown): { title: string; message: string } {
  // Handle network errors
  if (!navigator.onLine) {
    return {
      title: 'Žádné připojení',
      message: 'Zkontrolujte připojení k internetu'
    }
  }

  let errorCode: string = 'UNKNOWN_ERROR'
  let errorMessage: string = 'Neznámá chyba'

  if (typeof error === 'string') {
    errorCode = error
    errorMessage = error
  } else if (error && typeof error === 'object') {
    const apiError = error as ApiError
    if (apiError.code) {
      errorCode = apiError.code
      errorMessage = apiError.message || apiError.code
    } else if (apiError.message) {
      errorCode = apiError.message
      errorMessage = apiError.message
    }
  }

  // ✅ Check for specific phrases in error message
  if (errorMessage.toLowerCase().includes('email') && 
      (errorMessage.toLowerCase().includes('exist') || 
       errorMessage.toLowerCase().includes('taken') || 
       errorMessage.toLowerCase().includes('used'))) {
    return {
      title: 'Email již existuje',
      message: 'Tento email se již používá. Zkuste jiný nebo se přihlaste.'
    }
  }

  // Map specific error codes
  if (errorCode in REGISTER_ERROR_MESSAGES) {
    return {
      title: 'Chyba registrace',
      message: REGISTER_ERROR_MESSAGES[errorCode as keyof typeof REGISTER_ERROR_MESSAGES]
    }
  }

  // Handle HTTP status codes
  if (errorMessage.includes('409') || errorMessage.includes('Conflict')) {
    return {
      title: 'Email již existuje',
      message: 'Tento email se již používá'
    }
  }

  if (errorMessage.includes('400') || errorMessage.includes('Bad Request')) {
    return {
      title: 'Neplatné údaje',
      message: 'Zkontrolujte zadané údaje'
    }
  }

  if (errorMessage.includes('429')) {
    return {
      title: 'Příliš mnoho pokusů',
      message: 'Zkuste to za chvíli znovu'
    }
  }

  if (errorMessage.includes('500') || errorMessage.includes('Internal Server Error')) {
    return {
      title: 'Problém se serverem',
      message: 'Zkuste to prosím později'
    }
  }

  // Default error
  return {
    title: 'Chyba registrace',
    message: errorMessage || 'Něco se pokazilo, zkuste to znovu'
  }
}

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
  const { login } = useAuth()

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
    const form = e.currentTarget as HTMLFormElement
    const formData = new FormData(form)
    const email = formData.get('email') as string
    const name = formData.get('name') as string

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      })

      // ✅ Better error handling
      if (!res.ok) {
        let errorData: ApiError
        try {
          errorData = await res.json() as ApiError
        } catch {
          // If response is not JSON, create error based on status
          errorData = {
            code: res.status === 409 ? 'EMAIL_ALREADY_EXISTS' : 'SERVER_ERROR',
            message: res.status === 409 ? 'Email se již používá' : 'Chyba serveru'
          }
        }

        throw errorData
      }

      const data: { token?: string; user?: { name: string } } = await res.json()
      
      if (data.token) {
        localStorage.setItem('token', data.token)
        login(data.token)
        window.dispatchEvent(new CustomEvent('authChange', {
          detail: { isLoggedIn: true }
        }))
      }
      
      setSuccess(true)
      setLoading(false)
      showSuccess('Registrace úspěšná', `Vítejte, ${name}! Přesměrovávám na hlavní stránku...`)
      setTimeout(() => router.push('/'), 1000)
    } catch (err: unknown) {
      console.error('Registration error:', err) // ✅ Debug logging
      
      const { title, message } = getRegisterErrorMessage(err)
      setError(message)
      setLoading(false)
      showError(title, message)
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