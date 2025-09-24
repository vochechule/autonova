'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import '../styles/LoginForm.scss'
import { ButtonLoading } from './LoadingStates'
import { useToast } from '../contexts/ToastContext'
import { useAuth } from '../hooks/AuthProvider'

const API_URL = process.env.NEXT_PUBLIC_API_URL

// ✅ Define proper error types
interface ApiError {
  code?: string
  message?: string
  statusCode?: number
}

// ✅ Error code to message mapping
const ERROR_MESSAGES = {
  'INVALID_CREDENTIALS': 'Neplatný email nebo heslo',
  'USER_NOT_FOUND': 'Uživatel s tímto emailem neexistuje',
  'INVALID_PASSWORD': 'Nesprávné heslo',
  'ACCOUNT_LOCKED': 'Účet je dočasně zablokován',
  'EMAIL_NOT_VERIFIED': 'Email ještě nebyl ověřen',
  'NETWORK_ERROR': 'Problém se sítí, zkuste to znovu',
  'SERVER_ERROR': 'Problém se serverem, zkuste to později',
  'VALIDATION_ERROR': 'Neplatné údaje',
  'RATE_LIMIT': 'Příliš mnoho pokusů, zkuste to později'
} as const

function getErrorMessage(error: unknown): { title: string; message: string } {
  // Handle network errors
  if (!navigator.onLine) {
    return {
      title: 'Žádné připojení',
      message: 'Zkontrolujte připojení k internetu'
    }
  }

  // Handle different error formats
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

  // Map specific error codes to user-friendly messages
  if (errorCode in ERROR_MESSAGES) {
    return {
      title: 'Chyba přihlášení',
      message: ERROR_MESSAGES[errorCode as keyof typeof ERROR_MESSAGES]
    }
  }

  // Handle HTTP status codes
  if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
    return {
      title: 'Neplatné údaje',
      message: 'Email nebo heslo není správné'
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

  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return {
      title: 'Problém se sítí',
      message: 'Zkontrolujte připojení k internetu'
    }
  }

  // Default error
  return {
    title: 'Chyba přihlášení',
    message: errorMessage || 'Něco se pokazilo, zkuste to znovu'
  }
}

export default function LoginForm() {
  const router = useRouter()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false) // ✅ PŘIDÁNO
  const { showSuccess, showError } = useToast()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const form = e.currentTarget
    const formData = new FormData(form)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      // ✅ Better error handling
      if (!res.ok) {
        let errorData: ApiError
        try {
          errorData = await res.json() as ApiError
        } catch {
          // If response is not JSON, create error based on status
          errorData = {
            code: res.status === 401 ? 'INVALID_CREDENTIALS' : 'SERVER_ERROR',
            message: res.status === 401 ? 'Neplatné přihlašovací údaje' : 'Chyba serveru'
          }
        }

        throw errorData
      }

      const data: { token: string } = await res.json()

      localStorage.setItem('token', data.token)
      login(data.token)
      window.dispatchEvent(new Event('loginStatusChanged'))
      setSuccess(true)
      setLoading(false)
      showSuccess('Přihlášení úspěšné', 'Vítejte zpět! Přesměrovávám na hlavní stránku...')
      setTimeout(() => router.push('/'), 1000)
    } catch (err: unknown) {
      console.error('Login error:', err) // ✅ Debug logging
      
      const { title, message } = getErrorMessage(err)
      setError(message)
      setLoading(false)
      showError(title, message)
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
        type={showPassword ? 'text' : 'password'} // ✅ ZMĚNĚNO
        required 
        placeholder="Heslo" 
        disabled={loading}
      />
      
      {/* ✅ PŘIDÁNO - Show password checkbox */}
      <div className="login-form__show-password">
        <label className="login-form__checkbox-label">
          <input
            type="checkbox"
            checked={showPassword}
            onChange={(e) => setShowPassword(e.target.checked)}
            disabled={loading}
          />
          Zobrazit heslo
        </label>
      </div>
      
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