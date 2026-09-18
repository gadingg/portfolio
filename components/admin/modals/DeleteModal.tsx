'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Project } from '@/types/portfolio';

interface DeleteModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
}

export function DeleteModal({ project, isOpen, onClose, onConfirm }: DeleteModalProps) {
  const [confirmInput, setConfirmInput] = useState('');
  const [deleting, setDeleting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    inputRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !deleting) onClose();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isOpen, deleting, onClose]);

  if (!isOpen || !project) return null;

  const isMatched = confirmInput.trim().toLowerCase() === project.title.trim().toLowerCase();

  const keepFocusInside = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab') return;
    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), a[href]');
    if (!focusable?.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const handleDelete = async () => {
    if (!isMatched || deleting) return;
    setDeleting(true);
    try {
      await onConfirm(project.id);
      onClose();
    } finally {
      setDeleting(false);
      setConfirmInput('');
    }
  };

  return (
    <div
      ref={dialogRef}
      onKeyDown={keepFocusInside}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        padding: '20px',
      }}
    >
      <div
        className="modal-card"
        style={{
          width: '100%',
          maxWidth: '460px',
          background: '#13181f',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '1.5rem',
          padding: '32px',
          color: '#fff',
        }}
      >
        <h2 id="delete-dialog-title" style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 8px', color: '#ff8b8b' }}>
          Delete Study Case?
        </h2>
        <p id="delete-dialog-description" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.78)', lineHeight: 1.6, margin: '0 0 20px' }}>
          This action is permanent and cannot be undone. To confirm, please type the project title below:
        </p>

        <p
          style={{
            fontSize: '12px',
            fontWeight: 700,
            padding: '8px 12px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '8px',
            fontFamily: 'monospace',
            margin: '0 0 16px',
            userSelect: 'all',
          }}
        >
          {project.title}
        </p>

        <input
          ref={inputRef}
          aria-label="Type the project title to confirm deletion"
          type="text"
          value={confirmInput}
          onChange={(e) => setConfirmInput(e.target.value)}
          placeholder="Type exact title to confirm"
          disabled={deleting}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#fff',
            fontSize: '13px',
            marginBottom: '24px',
          }}
        />

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            style={{
              padding: '10px 18px',
              borderRadius: '999px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={!isMatched || deleting}
            style={{
              padding: '10px 20px',
              borderRadius: '999px',
              background: isMatched ? '#ef4444' : 'rgba(239, 68, 68, 0.3)',
              border: 'none',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 700,
              cursor: isMatched && !deleting ? 'pointer' : 'not-allowed',
            }}
          >
            {deleting ? 'Deleting...' : 'Delete Permanently'}
          </button>
        </div>
      </div>
    </div>
  );
}
