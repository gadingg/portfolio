import React from 'react';
import Image from 'next/image';
import { ContentBlock } from '@/types/portfolio';
import { MetricsBlock } from './MetricsBlock';

export function StudyCaseRenderer({ blocks }: { blocks: ContentBlock[] }) {
  if (!blocks || blocks.length === 0) return null;

  return (
    <div className="study-case-blocks" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {blocks.map((block, index) => {
        const { block_type, content_json } = block;
        const content = (content_json || {}) as any;

        switch (block_type) {
          case 'heading': {
            const level = content.level || 2;
            const Tag = level === 3 ? 'h3' : 'h2';
            return (
              <Tag
                key={block.id || index}
                style={{
                  fontSize: level === 3 ? 'clamp(1.4rem, 2.5vw, 1.8rem)' : 'clamp(2rem, 3.5vw, 2.6rem)',
                  fontWeight: 600,
                  letterSpacing: '-0.04em',
                  margin: '32px 0 8px',
                  color: 'var(--ink)',
                }}
              >
                {content.text}
              </Tag>
            );
          }

          case 'paragraph': {
            return (
              <p
                key={block.id || index}
                style={{
                  fontSize: 'clamp(16px, 1.3vw, 18px)',
                  lineHeight: 1.85,
                  color: 'var(--muted)',
                  margin: '0 0 16px',
                  letterSpacing: '-0.005em',
                }}
              >
                {content.text}
              </p>
            );
          }

          case 'image': {
            const widthMode = content.width_mode || 'standard';
            return (
              <figure
                key={block.id || index}
                style={{
                  margin: widthMode === 'full' ? '40px -8vw' : '32px 0',
                  borderRadius: widthMode === 'full' ? 0 : '1.5rem',
                  overflow: 'hidden',
                }}
              >
                <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9' }}>
                  <Image
                    src={content.url || 'https://picsum.photos/id/1/1200/800'}
                    alt={content.alt || 'Case study illustration'}
                    fill
                    sizes="(max-width: 768px) 100vw, 1200px"
                    style={{ objectFit: 'cover' }}
                    loading="lazy"
                  />
                </div>
                {content.caption && (
                  <figcaption
                    style={{
                      fontSize: '12px',
                      color: 'var(--muted)',
                      textAlign: 'center',
                      marginTop: '10px',
                      letterSpacing: '0.02em',
                    }}
                  >
                    {content.caption}
                  </figcaption>
                )}
              </figure>
            );
          }

          case 'metrics': {
            return <MetricsBlock key={block.id || index} content={content} />;
          }

          case 'quote': {
            return (
              <blockquote
                key={block.id || index}
                style={{
                  margin: '36px 0',
                  padding: '24px 32px',
                  borderLeft: '3px solid var(--amber)',
                  background: 'var(--surface)',
                  borderRadius: '0 1rem 1rem 0',
                }}
              >
                <p
                  style={{
                    fontSize: 'clamp(18px, 2vw, 22px)',
                    fontStyle: 'italic',
                    lineHeight: 1.6,
                    color: 'var(--ink)',
                    margin: 0,
                  }}
                >
                  &ldquo;{content.quote}&rdquo;
                </p>
                {content.attribution && (
                  <cite
                    style={{
                      display: 'block',
                      marginTop: '12px',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--muted)',
                      fontStyle: 'normal',
                    }}
                  >
                    — {content.attribution} {content.role ? `(${content.role})` : ''}
                  </cite>
                )}
              </blockquote>
            );
          }

          case 'gallery': {
            const images = content.images || [];
            return (
              <div
                key={block.id || index}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr)) ',
                  gap: '16px',
                  margin: '32px 0',
                }}
              >
                {images.map((img: any, i: number) => (
                  <div
                    key={i}
                    style={{
                      position: 'relative',
                      aspectRatio: '4 / 3',
                      borderRadius: '1rem',
                      overflow: 'hidden',
                    }}
                  >
                    <Image
                      src={img.url}
                      alt={img.alt || `Gallery item ${i + 1}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      style={{ objectFit: 'cover' }}
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            );
          }

          case 'video': {
            return (
              <div
                key={block.id || index}
                style={{
                  margin: '32px 0',
                  borderRadius: '1.5rem',
                  overflow: 'hidden',
                  position: 'relative',
                  aspectRatio: '16 / 9',
                }}
              >
                <video
                  controls
                  muted
                  playsInline
                  poster={content.poster}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                >
                  <source src={content.url} type="video/mp4" />
                </video>
              </div>
            );
          }

          case 'list': {
            const items = content.items || [];
            return (
              <ul key={block.id || index} style={{ paddingLeft: '24px', margin: '16px 0', lineHeight: 1.8 }}>
                {items.map((item: string, i: number) => (
                  <li key={i} style={{ color: 'var(--muted)', fontSize: '16px' }}>
                    {item}
                  </li>
                ))}
              </ul>
            );
          }

          case 'divider': {
            return (
              <hr
                key={block.id || index}
                style={{
                  border: 'none',
                  borderTop: '1px solid var(--border)',
                  margin: '48px 0',
                }}
              />
            );
          }

          case 'link': {
            return (
              <div key={block.id || index} style={{ margin: '24px 0' }}>
                <a
                  href={content.url}
                  target={content.target || '_blank'}
                  rel="noreferrer"
                  className="button button--secondary"
                >
                  {content.label || 'Open Link'} ↗
                </a>
              </div>
            );
          }

          default:
            return null;
        }
      })}
    </div>
  );
}
