'use client'
import { useState } from 'react'
import '../styles/components/ProfileModals.scss'
// ✅ PŘIDÁNO - Loading states a toast
import { FormLoading, ButtonLoading } from './LoadingStates'
import { useToast } from '../contexts/ToastContext'

interface ChangePasswordModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ChangePasswordModal({ isOpen, onClose, onSuccess }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  // ✅ PŘIDÁNO - Toast hook
  const { showSuccess, showError } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      setError('Nová hesla se neshodují')
      return
    }
    
    if (newPassword.length < 6) {
      setError('Nové heslo musí mít alespoň 6 znaků')
      return
    }

    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:3000/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      })

      if (res.ok) {
        // ✅ UPRAVENO - Toast místo onSuccess callback
        showSuccess('Heslo změněno', 'Vaše heslo bylo úspěšně změněno')
        onSuccess()
        onClose()
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        const errorData = await res.json()
        const errorMessage = errorData.message || 'Změna hesla se nezdařila'
        setError(errorMessage)
        // ✅ PŘIDÁNO - Toast pro chybu
        showError('Chyba při změně hesla', errorMessage)
      }
    } catch (err) {
      const errorMessage = 'Nepodařilo se změnit heslo'
      setError(errorMessage)
      showError('Chyba sítě', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="profile-modal__backdrop" onClick={onClose}>
      <div className="profile-modal__content" onClick={e => e.stopPropagation()} style={{ position: 'relative' }}>
        <div className="profile-modal__header">
          <h3>Změnit heslo</h3>
          <button className="profile-modal__close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="profile-modal__form">
          {error && <div className="profile-modal__error">{error}</div>}
          
          <div className="profile-modal__field">
            <label htmlFor="currentPassword">Současné heslo</label>
            <input
              type="password"
              id="currentPassword"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="profile-modal__field">
            <label htmlFor="newPassword">Nové heslo</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              minLength={6}
              disabled={loading}
            />
          </div>

          <div className="profile-modal__field">
            <label htmlFor="confirmPassword">Potvrdit nové heslo</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="profile-modal__actions">
            <button type="button" onClick={onClose} className="profile-modal__btn secondary" disabled={loading}>
              Zrušit
            </button>
            <button type="submit" disabled={loading} className="profile-modal__btn primary">
              {loading ? <ButtonLoading /> : 'Změnit heslo'}
            </button>
          </div>
        </form>

        {/* ✅ PŘIDÁNO - Loading overlay */}
        {loading && <FormLoading message="Měním heslo..." />}
      </div>
    </div>
  )
}

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  user: any
  onSuccess: (updatedUser: any) => void
}

export function EditProfileModal({ isOpen, onClose, user, onSuccess }: EditProfileModalProps) {
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  // ✅ PŘIDÁNO - Toast hook
  const { showSuccess, showError } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:3000/user/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, email })
      })

      if (res.ok) {
        const updatedUser = await res.json()
        // ✅ UPRAVENO - Toast místo alert
        showSuccess('Profil aktualizován', 'Vaše údaje byly úspěšně aktualizovány')
        onSuccess(updatedUser)
        onClose()
      } else {
        const errorData = await res.json()
        const errorMessage = errorData.message || 'Aktualizace se nezdařila'
        setError(errorMessage)
        showError('Chyba při aktualizaci', errorMessage)
      }
    } catch (err) {
      const errorMessage = 'Nepodařilo se aktualizovat profil'
      setError(errorMessage)
      showError('Chyba sítě', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="profile-modal__backdrop" onClick={onClose}>
      <div className="profile-modal__content" onClick={e => e.stopPropagation()} style={{ position: 'relative' }}>
        <div className="profile-modal__header">
          <h3>Upravit profil</h3>
          <button className="profile-modal__close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="profile-modal__form">
          {error && <div className="profile-modal__error">{error}</div>}
          
          <div className="profile-modal__field">
            <label htmlFor="name">Jméno</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="profile-modal__field">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="profile-modal__actions">
            <button type="button" onClick={onClose} className="profile-modal__btn secondary" disabled={loading}>
              Zrušit
            </button>
            <button type="submit" disabled={loading} className="profile-modal__btn primary">
              {loading ? <ButtonLoading /> : 'Uložit změny'}
            </button>
          </div>
        </form>

        {/* ✅ PŘIDÁNO - Loading overlay */}
        {loading && <FormLoading message="Ukládám změny..." />}
      </div>
    </div>
  )
}

interface DeleteAccountModalProps {
  isOpen: boolean
  onClose: () => void
}

export function DeleteAccountModal({ isOpen, onClose }: DeleteAccountModalProps) {
  const [password, setPassword] = useState('')
  const [confirmText, setConfirmText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  // ✅ PŘIDÁNO - Toast hook
  const { showError, showWarning } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (confirmText !== 'SMAZAT') {
      setError('Musíte napsat "SMAZAT" pro potvrzení')
      return
    }

    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:3000/user/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ password })
      })

      if (res.ok) {
        localStorage.removeItem('token')
        // ✅ PŘIDÁNO - Toast před redirectem
        showWarning('Účet smazán', 'Váš účet byl trvale smazán')
        setTimeout(() => {
          window.location.href = '/login?message=Account deleted successfully'
        }, 1500)
      } else {
        const errorData = await res.json()
        const errorMessage = errorData.message || 'Smazání účtu se nezdařilo'
        setError(errorMessage)
        showError('Chyba při mazání účtu', errorMessage)
      }
    } catch (err) {
      const errorMessage = 'Nepodařilo se smazat účet'
      setError(errorMessage)
      showError('Chyba sítě', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="profile-modal__backdrop" onClick={onClose}>
      <div className="profile-modal__content danger" onClick={e => e.stopPropagation()} style={{ position: 'relative' }}>
        <div className="profile-modal__header">
          <h3>Smazat účet</h3>
          <button className="profile-modal__close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="profile-modal__warning">
          <p><strong>Pozor!</strong> Tato akce je nevratná.</p>
          <p>Smazáním účtu se trvale odstraní:</p>
          <ul>
            <li>Všechny vaše inzeráty</li>
            <li>Uložené inzeráty</li>
            <li>Hodnocení a komentáře</li>
            <li>Všechna osobní data</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="profile-modal__form">
          {error && <div className="profile-modal__error">{error}</div>}
          
          <div className="profile-modal__field">
            <label htmlFor="password">Současné heslo</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="profile-modal__field">
            <label htmlFor="confirmText">
              Pro potvrzení napište: <strong>SMAZAT</strong>
            </label>
            <input
              type="text"
              id="confirmText"
              value={confirmText}
              onChange={e => setConfirmText(e.target.value)}
              placeholder="SMAZAT"
              required
              disabled={loading}
            />
          </div>

          <div className="profile-modal__actions">
            <button type="button" onClick={onClose} className="profile-modal__btn secondary" disabled={loading}>
              Zrušit
            </button>
            <button type="submit" disabled={loading} className="profile-modal__btn danger">
              {loading ? <ButtonLoading /> : 'Smazat účet'}
            </button>
          </div>
        </form>

        {/* ✅ PŘIDÁNO - Loading overlay */}
        {loading && <FormLoading message="Mažu účet..." />}
      </div>
    </div>
  )
}