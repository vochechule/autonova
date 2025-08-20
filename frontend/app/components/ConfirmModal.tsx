import React from 'react'

interface ConfirmModalProps {
  open: boolean
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

export function ConfirmModal({
  open,
  title = 'Potvrzení',
  message,
  confirmText = 'Ano, smazat',
  cancelText = 'Zrušit',
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmModalProps) {
  if (!open) return null
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>{title}</h3>
        <p style={{ margin: '18px 0 28px 0' }}>{message}</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button
            className="modal-btn modal-btn--cancel"
            onClick={onCancel}
            disabled={loading}
            type="button"
          >
            {cancelText}
          </button>
          <button
            className="modal-btn modal-btn--danger"
            onClick={onConfirm}
            disabled={loading}
            type="button"
          >
            {loading ? 'Mažu…' : confirmText}
          </button>
        </div>
      </div>
      <style jsx>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.35);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .modal {
          background: #fff;
          color: #1a202c;
          border-radius: 16px;
          padding: 2rem 1.5rem 1.5rem 1.5rem;
          box-shadow: 0 8px 32px rgba(0,0,0,0.18);
          min-width: 320px;
          max-width: 90vw;
          text-align: center;
        }
        .modal-btn {
          padding: 0.6rem 1.4rem;
          border-radius: 8px;
          border: none;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.18s;
        }
        .modal-btn--cancel {
          background: #e3eaf5;
          color: #222;
        }
        .modal-btn--danger {
          background: #dc2626;
          color: #fff;
        }
        .modal-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        @media (prefers-color-scheme: dark) {
          .modal { background: #232b36; color: #e2e8f0; }
          .modal-btn--cancel { background: #232b36; color: #e2e8f0; }
        }
      `}</style>
    </div>
  )
}