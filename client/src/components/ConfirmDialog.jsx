import { AlertTriangle, X } from 'lucide-react';
import { useEffect, useRef } from 'react';

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', busy = false, onConfirm, onCancel }) {
  const cancelRef = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    cancelRef.current?.focus();
    const onKeyDown = (event) => { if (event.key === 'Escape' && !busy) onCancel(); };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, busy, onCancel]);
  if (!open) return null;
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onCancel(); }}>
      <div className="modal-card" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-message">
        <button className="modal-close" type="button" onClick={onCancel} disabled={busy} aria-label="Close dialog"><X size={18} /></button>
        <div className="modal-warning"><AlertTriangle size={24} /></div>
        <h2 id="confirm-title">{title}</h2>
        <p id="confirm-message">{message}</p>
        <div className="modal-actions">
          <button ref={cancelRef} type="button" className="button button-ghost" onClick={onCancel} disabled={busy}>Cancel</button>
          <button type="button" className="button button-danger" onClick={onConfirm} disabled={busy}>{busy ? 'Deleting…' : confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

