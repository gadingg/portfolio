'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function PinLoginForm() {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submitPin = async (pinValue: string) => {
    const cleanPin = (pinValue || '').trim();
    if (cleanPin.length === 0 || loading) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: cleanPin }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid access PIN.');
        setShake(true);
        setPin('');
        setTimeout(() => setShake(false), 500);
        return;
      }

      // Success -> Redirect to Admin Dashboard
      router.push('/admintgadink/dashboard');
      router.refresh();
    } catch {
      setError('Connection failed. Please retry.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitPin(pin);
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPin(val);
    if (val.length === 6) {
      submitPin(val);
    }
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '380px',
        padding: '40px 32px',
        borderRadius: '1.75rem',
        background: 'rgba(255, 255, 255, 0.035)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(24px)',
        textAlign: 'center',
        transform: shake ? 'translateX(-8px)' : 'none',
        transition: 'transform 0.1s ease',
      }}
    >
      <div style={{ marginBottom: '28px' }}>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '0.25em',
            color: 'var(--amber)',
            textTransform: 'uppercase',
          }}
        >
          GADING ADMIN
        </span>
        <h1
          style={{
            fontSize: '22px',
            fontWeight: 600,
            letterSpacing: '-0.02em',
            margin: '8px 0 4px',
            color: 'var(--ink)',
          }}
        >
          Private Access
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0 }}>
          Enter 6-digit access PIN to unlock CMS
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ position: 'relative', marginBottom: '24px' }}>
          {/* Masked Dots Display */}
          <div
            onClick={() => inputRef.current?.focus()}
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '14px',
              cursor: 'text',
              padding: '16px 0',
            }}
          >
            {[0, 1, 2, 3, 4, 5].map((index) => {
              const isFilled = index < pin.length;
              const isActive = index === pin.length;
              return (
                <div
                  key={index}
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    border: '2px solid',
                    borderColor: isFilled
                      ? 'var(--amber)'
                      : isActive
                      ? 'rgba(255, 255, 255, 0.4)'
                      : 'rgba(255, 255, 255, 0.15)',
                    background: isFilled ? 'var(--amber)' : 'transparent',
                    boxShadow: isFilled ? '0 0 12px rgba(255, 180, 94, 0.4)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                />
              );
            })}
          </div>

          {/* Hidden Real Input */}
          <input
            ref={inputRef}
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={pin}
            onChange={handlePinChange}
            disabled={loading}
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 0,
              cursor: 'default',
              width: '100%',
              height: '100%',
            }}
            aria-label="Enter 6-digit access PIN"
            autoComplete="current-password"
          />
        </div>

        {error && (
          <p
            style={{
              color: '#ef4444',
              fontSize: '12px',
              fontWeight: 600,
              marginBottom: '20px',
              marginTop: '-8px',
            }}
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || pin.length < 6}
          className="button button--primary"
          style={{
            width: '100%',
            minHeight: '48px',
            opacity: pin.length === 6 && !loading ? 1 : 0.4,
            cursor: pin.length === 6 && !loading ? 'pointer' : 'not-allowed',
          }}
        >
          {loading ? 'VERIFYING...' : 'ENTER DASHBOARD'}
        </button>
      </form>
    </div>
  );
}
