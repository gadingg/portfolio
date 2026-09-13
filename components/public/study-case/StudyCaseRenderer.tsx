import React from 'react';
import Image from 'next/image';
import { ContentBlock } from '@/types/portfolio';
import { MetricsBlock } from './MetricsBlock';

export function StudyCaseRenderer({ blocks }: { blocks: ContentBlock[] }) {
  if (!blocks || blocks.length === 0) return null;

  return (
    <div className="study-case-blocks flex flex-col gap-2">
      {blocks.map((block, index) => {
        const { block_type, content_json } = block;
        const content = (content_json || {}) as any;

        switch (block_type) {
          case 'heading': {
            const level = content.level || 2;
            if (level === 3) {
              return (
                <h3
                  key={block.id || index}
                  className="text-xl sm:text-2xl font-bold tracking-[-0.03em] text-[#f3f0e8] mt-8 mb-3 leading-snug"
                >
                  {content.text}
                </h3>
              );
            }
            return (
              <h2
                key={block.id || index}
                className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-[-0.04em] text-[#f3f0e8] mt-12 mb-4 leading-tight"
              >
                {content.text}
              </h2>
            );
          }

          case 'paragraph': {
            return (
              <p
                key={block.id || index}
                className="text-base sm:text-lg leading-[1.8] text-[#f3f0e8]/75 mb-6 tracking-normal"
              >
                {content.text}
              </p>
            );
          }

          case 'image': {
            const widthMode = content.width_mode || 'standard';
            return (
              <figure key={block.id || index} className="my-8 sm:my-10">
                <div
                  className={`glass overflow-hidden p-2 sm:p-3 border border-[#f3f0e8]/10 ${
                    widthMode === 'full'
                      ? 'rounded-none sm:rounded-[32px] -mx-4 sm:mx-0'
                      : 'rounded-[20px] sm:rounded-[28px]'
                  }`}
                >
                  <div className="relative w-full aspect-[16/9] rounded-[14px] sm:rounded-[22px] overflow-hidden bg-[#10110f]">
                    <Image
                      src={content.url || 'https://picsum.photos/id/1/1200/800'}
                      alt={content.alt || 'Case study visual preview'}
                      fill
                      sizes="(max-width: 768px) 100vw, 1000px"
                      className="object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
                {content.caption && (
                  <figcaption className="text-center text-xs font-medium text-[#f3f0e8]/50 mt-3 tracking-wide">
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
                className="glass rounded-[24px] p-6 sm:p-8 my-8 border-l-4 border-l-[#ff5a1f] border-t border-r border-b border-[#f3f0e8]/10"
              >
                <p className="text-lg sm:text-xl md:text-2xl italic font-medium leading-relaxed text-[#f3f0e8]">
                  &ldquo;{content.quote}&rdquo;
                </p>
                {content.attribution && (
                  <cite className="block mt-4 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#ff5a1f] not-italic">
                    · {content.attribution} {content.role ? `(${content.role})` : ''}
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
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 my-8"
              >
                {images.map((img: any, i: number) => (
                  <div
                    key={i}
                    className="glass rounded-[20px] p-2 border border-[#f3f0e8]/10 overflow-hidden"
                  >
                    <div className="relative aspect-[4/3] rounded-[14px] overflow-hidden bg-[#10110f]">
                      <Image
                        src={img.url}
                        alt={img.alt || `Gallery item ${i + 1}`}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover"
                        loading="lazy"
                      />
                    </div>
                  </div>
                ))}
              </div>
            );
          }

          case 'video': {
            return (
              <div
                key={block.id || index}
                className="glass rounded-[20px] sm:rounded-[28px] p-2 sm:p-3 border border-[#f3f0e8]/10 overflow-hidden my-8"
              >
                <div className="relative aspect-[16/9] rounded-[14px] sm:rounded-[22px] overflow-hidden bg-[#10110f]">
                  <video
                    controls
                    muted
                    playsInline
                    poster={content.poster}
                    className="w-full h-full object-cover"
                  >
                    <source src={content.url} type="video/mp4" />
                  </video>
                </div>
              </div>
            );
          }

          case 'list': {
            const items = content.items || [];
            return (
              <ul key={block.id || index} className="space-y-3 my-6 pl-1">
                {items.map((item: string, i: number) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-base sm:text-lg text-[#f3f0e8]/75 leading-relaxed"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[#ff5a1f] mt-2.5 shrink-0 shadow-[0_0_8px_rgba(255,90,31,0.6)]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            );
          }

          case 'divider': {
            return (
              <hr
                key={block.id || index}
                className="border-none border-t border-[#f3f0e8]/10 my-10"
              />
            );
          }

          case 'link': {
            return (
              <div key={block.id || index} className="my-6">
                <a
                  href={content.url}
                  target={content.target || '_blank'}
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-[#f3f0e8]/20 bg-white/[0.04] px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#f3f0e8] hover:border-[#ff5a1f] hover:text-[#ff5a1f] hover:bg-[#ff5a1f]/10 transition min-h-[44px]"
                >
                  <span>{content.label || 'Open Link'}</span>
                  <span aria-hidden="true">↗</span>
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
