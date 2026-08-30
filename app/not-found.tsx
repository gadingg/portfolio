import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '24px',
      }}
    >
      <div style={{ maxWidth: '480px' }}>
        <p className="eyebrow" style={{ color: 'var(--amber)', marginBottom: '16px' }}>
          404 · NOT FOUND
        </p>
        <h1
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 600,
            letterSpacing: '-0.04em',
            margin: '0 0 16px',
          }}
        >
          This project doesn&apos;t exist.
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '15px', lineHeight: 1.7, marginBottom: '32px' }}>
          The case study you are looking for might have been moved, unpublished, or does not exist.
        </p>
        <Link href="/#recent-works" className="button button--primary">
          BACK TO WORKS →
        </Link>
      </div>
    </div>
  );
}
