// Create: frontend/app/components/AdForm/sections/AdditionalInfoSection.tsx
import React from 'react'
import type { AdData, FieldErrors } from '../types'

interface AdditionalInfoSectionProps {
  fieldErrors: FieldErrors
  adData?: AdData | null
  mode: 'create' | 'edit'
  onFieldChange: (fieldName: string) => void
}

export const AdditionalInfoSection: React.FC<AdditionalInfoSectionProps> = ({
  adData,
  mode}) => {
  return (
    <div className="form-section">
      <h3 className="form-section__title">Dodatečné informace</h3>
      <div className="form-grid">
        <div className="form-group form-group--full-width">
          <label htmlFor="safetyFeatures">Bezpečnostní výbava</label>
          <textarea 
            name="safetyFeatures" 
            id="safetyFeatures" 
            placeholder="Např. ABS, ESP, airbag řidiče, airbag spolujezdce, boční airbagy..."
            rows={3}
            defaultValue={mode === 'edit' ? adData?.safetyFeatures || '' : ''}
          />
          <small className="form-help">
            Popište bezpečnostní prvky vozidla (volitelné)
          </small>
        </div>

        <div className="form-group form-group--full-width">
          <label htmlFor="assistSystems">Asistenční systémy</label>
          <textarea 
            name="assistSystems" 
            id="assistSystems" 
            placeholder="Např. parkovací senzory, kamera, tempomat, asistent jízdy v pruzích..."
            rows={3}
            defaultValue={mode === 'edit' ? adData?.assistSystems || '' : ''}
          />
          <small className="form-help">
            Popište asistenční a poloautomatické systémy (volitelné)
          </small>
        </div>

        <div className="form-group form-group--full-width">
          <label htmlFor="securityFeatures">Zabezpečení</label>
          <textarea 
            name="securityFeatures" 
            id="securityFeatures" 
            placeholder="Např. centrální zamykání, imobilizér, alarm, satelitní sledování..."
            rows={3}
            defaultValue={mode === 'edit' ? adData?.securityFeatures || '' : ''}
          />
          <small className="form-help">
            Popište bezpečnostní a ochranné prvky (volitelné)
          </small>
        </div>

        <div className="form-group form-group--full-width">
          <label htmlFor="interiorComfort">Komfort a vybavení</label>
          <textarea 
            name="interiorComfort" 
            id="interiorComfort" 
            placeholder="Např. kožené sedačky, vyhřívání sedadel, panoramatická střecha, navigace..."
            rows={3}
            defaultValue={mode === 'edit' ? adData?.interiorComfort || '' : ''}
          />
          <small className="form-help">
            Popište komfortní prvky a další výbavu (volitelné)
          </small>
        </div>
      </div>
      
      <div className="form-notice">
        <svg className="form-notice__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 16v-4"/>
          <path d="M12 8h.01"/>
        </svg>
        <p>
          <strong>Tip:</strong> Detailní popis výbavy pomůže zájemcům lépe se rozhodnout. 
          Uveďte i méně běžné prvky výbavy, které mohou být pro kupce důležité.
        </p>
      </div>
    </div>
  )
}