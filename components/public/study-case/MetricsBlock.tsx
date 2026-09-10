import React from 'react';
import { MetricsBlockContent } from '@/types/portfolio';

export function MetricsBlock({ content }: { content: MetricsBlockContent }) {
  if (!content?.items || content.items.length === 0) return null;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(180px, 1fr))`,
        gap: '20px',
        margin: '40px 0',
        padding: '32px 24px',
        borderRadius: '1.5rem',
        background: 'var(--surface)',
        border: '1px solid var(--border-strong)',
      }}
    >
      {content.items.map((item, idx) => (
        <div key={idx} style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              fontSize: 'clamp(2.4rem, 4vw, 3.2rem)',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              color: 'var(--amber)',
              lineHeight: 1.1,
            }}
          >
            {item.value}
          </span>
          <span
            style={{
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.05em',
              marginTop: '8px',
              textTransform: 'uppercase',
              color: 'var(--ink)',
            }}
          >
            {item.label}
          </span>
          {item.description && (
            <span
              style={{
                fontSize: '12px',
                color: 'var(--muted)',
                marginTop: '4px',
                lineHeight: 1.5,
              }}
            >
              {item.description}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
