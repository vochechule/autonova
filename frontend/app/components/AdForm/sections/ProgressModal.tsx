// Create: frontend/app/components/AdForm/sections/ProgressModal.tsx
import React from 'react'

interface ProgressModalProps {
  isOpen: boolean
  title: string
  message: string
  progress?: number | null
  currentStep?: string
  totalSteps?: number
  currentStepNumber?: number
  imageProgress?: {
    current: number
    total: number
    currentImageName?: string
  } | null
}

export const ProgressModal: React.FC<ProgressModalProps> = ({
  isOpen,
  title,
  message,
  progress,
  currentStep,
  totalSteps,
  currentStepNumber,
  imageProgress
}) => {
  if (!isOpen) return null

  return (
    <div className="progress-modal-overlay">
      <div className="progress-modal">
        {/* Header */}
        <div className="progress-modal__header">
          <div className="progress-modal__icon">
            <div className="progress-spinner">
              <svg viewBox="0 0 24 24" className="progress-spinner__svg">
                <circle 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray="62.83"
                  strokeDashoffset="15.71"
                />
              </svg>
            </div>
          </div>
          <h3 className="progress-modal__title">{title}</h3>
          <p className="progress-modal__message">{message}</p>
        </div>

        {/* Progress Steps */}
        {totalSteps && currentStepNumber && (
          <div className="progress-modal__steps">
            <div className="progress-steps">
              {Array.from({ length: totalSteps }, (_, index) => (
                <div 
                  key={index}
                  className={`progress-step ${
                    index + 1 < currentStepNumber ? 'completed' : 
                    index + 1 === currentStepNumber ? 'active' : 
                    'pending'
                  }`}
                >
                  <div className="progress-step__circle">
                    {index + 1 < currentStepNumber ? (
                      <svg viewBox="0 0 24 24" className="progress-step__check">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="progress-step__number">{index + 1}</span>
                    )}
                  </div>
                  {index < totalSteps - 1 && (
                    <div className={`progress-step__line ${index + 1 < currentStepNumber ? 'completed' : ''}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current Step */}
        {currentStep && (
          <div className="progress-modal__current-step">
            <span className="progress-modal__step-label">{currentStep}</span>
          </div>
        )}

        {/* Progress Bar */}
        {progress !== null && progress !== undefined && (
          <div className="progress-modal__progress">
            <div className="progress-bar">
              <div className="progress-bar__track">
                <div 
                  className="progress-bar__fill" 
                  style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
                />
              </div>
              <span className="progress-bar__text">{Math.round(progress)}%</span>
            </div>
          </div>
        )}

        {/* Image Upload Progress */}
        {imageProgress && (
          <div className="progress-modal__images">
            <div className="image-progress">
              <div className="image-progress__header">
                <span className="image-progress__title">Nahrávání obrázků</span>
                <span className="image-progress__count">
                  {imageProgress.current} / {imageProgress.total}
                </span>
              </div>
              
              {imageProgress.currentImageName && (
                <div className="image-progress__current">
                  <span className="image-progress__file-name">
                    {imageProgress.currentImageName}
                  </span>
                </div>
              )}

              <div className="image-progress__bar">
                <div className="progress-bar__track">
                  <div 
                    className="progress-bar__fill progress-bar__fill--images" 
                    style={{ 
                      width: `${(imageProgress.current / imageProgress.total) * 100}%` 
                    }}
                  />
                </div>
              </div>

              <div className="image-progress__grid">
                {Array.from({ length: imageProgress.total }, (_, index) => (
                  <div 
                    key={index}
                    className={`image-progress__item ${
                      index < imageProgress.current ? 'completed' : 
                      index === imageProgress.current ? 'uploading' : 
                      'pending'
                    }`}
                  >
                    {index < imageProgress.current ? (
                      <svg viewBox="0 0 24 24" className="image-progress__check">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : index === imageProgress.current ? (
                      <div className="image-progress__spinner">
                        <svg viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
                        </svg>
                      </div>
                    ) : (
                      <svg viewBox="0 0 24 24" className="image-progress__pending">
                        <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tips/Info */}
        <div className="progress-modal__tips">
          <div className="progress-tip">
            <svg viewBox="0 0 24 24" className="progress-tip__icon">
              <circle cx="12" cy="12" r="10" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <span>Nezavírejte tuto stránku během ukládání</span>
          </div>
        </div>
      </div>
    </div>
  )
}