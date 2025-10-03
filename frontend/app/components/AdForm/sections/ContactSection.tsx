// Create: frontend/app/components/AdForm/sections/ContactSection.tsx
import React from 'react'
import type { AdData, FieldErrors } from '../types'

interface ContactSectionProps {
  fieldErrors: FieldErrors
  adData?: AdData | null
  mode: 'create' | 'edit'
  onFieldChange: (fieldName: string) => void
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  fieldErrors,
  adData,
  mode,
  onFieldChange
}) => {
  return (
    <div className="form-section">
      <h3 className="form-section__title">Kontaktní údaje prodejce</h3>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="contactName">Jméno kontaktní osoby</label>
          <input 
            name="contactName" 
            id="contactName" 
            placeholder="Vyplňte pouze pokud se liší od vašeho jména" 
            defaultValue={mode === 'edit' ? adData?.contactName || '' : ''}
          />
          <small className="form-help">
            Volitelné - zobrazí se pouze pokud se liší od jména z vašeho profilu
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="contactPhone">
            Telefon <span className="required">*</span>
          </label>
          <input 
            name="contactPhone" 
            id="contactPhone" 
            type="tel" 
            required 
            placeholder="+420 123 456 789"
            className={fieldErrors.contactPhone ? 'error' : ''}
            onChange={() => onFieldChange('contactPhone')}
            defaultValue={mode === 'edit' ? adData?.contactPhone || '' : ''}
          />
          <small className="form-help">
            Telefon se zobrazí pouze registrovaným uživatelům
          </small>
          {fieldErrors.contactPhone && (
            <div className="field-error">{fieldErrors.contactPhone}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="contactEmail">Email</label>
          <input 
            name="contactEmail" 
            id="contactEmail" 
            type="email" 
            placeholder="vase@email.cz (volitelné)"
            className={fieldErrors.contactEmail ? 'error' : ''}
            onChange={() => onFieldChange('contactEmail')}
            defaultValue={mode === 'edit' ? adData?.contactEmail || '' : ''}
          />
          <small className="form-help">
            Email se zobrazí pouze registrovaným uživatelům
          </small>
          {fieldErrors.contactEmail && (
            <div className="field-error">{fieldErrors.contactEmail}</div>
          )}
        </div>
      </div>
      
      <div className="contact-notice">
        <svg className="contact-notice__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10"/>
          <path d="m9 12 2 2 4-4"/>
        </svg>
        <p>
          Telefon bude zobrazen zájemcům přímo u vašeho inzerátu. Email je volitelný.
          Můžete použít jiné kontakty než ty z vašeho profilu.
        </p>
      </div>
    </div>
  )
}