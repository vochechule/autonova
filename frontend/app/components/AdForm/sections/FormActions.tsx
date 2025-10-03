// Create: frontend/app/components/AdForm/sections/FormActions.tsx
import React from 'react'
import { useRouter } from 'next/navigation'
import { ButtonLoading, FormLoading } from '../../LoadingStates'
import type { FieldErrors } from '../types'

interface FormActionsProps {
  mode: 'create' | 'edit'
  loading: boolean
  success: boolean
  error: string | null
  fieldErrors: FieldErrors
  createdAdId: string | null
  adId?: string
  showLimitModal: boolean
  showLoginModal: boolean
  adLimits: any
  onCloseLimitModal: () => void
  onCloseLoginModal: () => void
}

export const FormActions: React.FC<FormActionsProps> = ({
  mode,
  loading,
  success,
  error,
  fieldErrors,
  createdAdId,
  adId,
  showLimitModal,
  showLoginModal,
  adLimits,
  onCloseLimitModal,
  onCloseLoginModal
}) => {
  const router = useRouter()

  const isSubmitDisabled = loading || 
    (mode === 'create' && adLimits && adLimits.remainingAds <= 0) || 
    Object.keys(fieldErrors).length > 0

  return (
    <>
      {/* Submit Button */}
      <button type="submit" disabled={isSubmitDisabled}>
        {loading ? (
          <ButtonLoading />
        ) : (
          mode === 'create' ? 'Přidat inzerát' : 'Uložit změny'
        )}
      </button>
      
      {/* Error Display */}
      {error && (
        <div className="form-error">
          <div className="form-error__icon">⚠️</div>
          <div className="form-error__content">
            <strong>Chyba:</strong> {error}
            {Object.keys(fieldErrors).length > 0 && (
              <div className="form-error__count">
                Počet chyb: {Object.keys(fieldErrors).length}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Success Message */}
      {success && (
        <div className="success-message">
          <div className="success-message__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="success-message__content">
            <h3 className="success-message__title">
              {mode === 'create' ? 'Inzerát byl úspěšně vytvořen!' : 'Inzerát byl úspěšně aktualizován!'}
            </h3>
            <p className="success-message__text">
              Přesměrovávám vás na detail inzerátu...
            </p>
            <div className="success-message__actions">
              {createdAdId && (
                <button 
                  type="button"
                  className="success-message__button"
                  onClick={() => router.push(`/ads/${createdAdId}`)}
                >
                  Zobrazit inzerát
                </button>
              )}
              <button 
                type="button"
                className="success-message__button success-message__button--secondary"
                onClick={() => router.push('/ads')}
              >
                Všechny inzeráty
              </button>
            </div>
          </div>
          <div className="success-message__spinner">
            <div className="spinner"></div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && <FormLoading message={mode === 'create' ? 'Ukládám inzerát...' : 'Ukládám změny...'} />}

      {/* Limit Modal */}
      {showLimitModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Limit inzerátů dosažen</h3>
            <p>
              {adLimits ? (
                `Dosáhli jste limitu aktivních inzerátů (${adLimits.currentAds}/${adLimits.maxAds}). ${
                  adLimits.isDealer 
                    ? 'Pro zvýšení limitu kontaktujte administrátora.' 
                    : 'Smažte některé inzeráty pro přidání nových.'
                }`
              ) : (
                'Máte již maximální počet aktivních inzerátů. Pro přidání nového nejprve některý smažte.'
              )}
            </p>
            <button onClick={onCloseLimitModal} className="success-message__button">
              Zavřít
            </button>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Přihlášení nutné</h3>
            <p>Pro přidání inzerátu se nejprve přihlaste ke svému účtu.</p>
            <button
              className="success-message__button"
              onClick={() => {
                onCloseLoginModal()
                router.push('/login')
              }}
            >
              Přihlásit se
            </button>
          </div>
        </div>
      )}
    </>
  )
}