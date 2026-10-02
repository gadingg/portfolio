import React from 'react';
import Image from 'next/image';
import {
  ContentBlock,
  GalleryBlockContent,
  HeadingBlockContent,
  ImageBlockContent,
  ListBlockContent,
  LinkBlockContent,
  MetricsBlockContent,
  ParagraphBlockContent,
  QuoteBlockContent,
  VideoBlockContent,
} from '@/types/portfolio';
import { MetricsBlock } from './MetricsBlock';

export function StudyCaseRenderer({ blocks }: { blocks: ContentBlock[] }) {
  if (!blocks || blocks.length === 0) return null;

  return (
    <div className="study-case-blocks flex flex-col gap-2">
      {blocks.map((block, index) => {
        const { block_type, content_json } = block;
        const content = content_json || {};

        switch (block_type) {
          case 'heading': {
            const heading = content as HeadingBlockContent;
            const level = heading.level || 2;
            if (level === 3) {
              return (
                <h3
                  key={block.id || index}
                  className="text-xl sm:text-2xl font-bold tracking-[-0.03em] text-[#f3f0e8] mt-8 mb-3 leading-snug"
                >
                  {heading.text}
                </h3>
              );
            }
            return (
              <h2
                key={block.id || index}
                className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-[-0.04em] text-[#f3f0e8] mt-12 mb-4 leading-tight"
              >
                {heading.text}
              </h2>
            );
          }

          case 'paragraph': {
            const paragraph = content as ParagraphBlockContent;
            return (
              <p
                key={block.id || index}
                className="case-copy mb-7 max-w-3xl text-base leading-[1.85] text-[#f3f0e8]/72 sm:text-lg"
              >
                {paragraph.text}
              </p>
            );
          }

          case 'image': {
            const image = content as ImageBlockContent;
            const widthMode = image.width_mode || 'standard';
            return (
              <figure
                key={block.id || index}
                className={`case-visual my-10 ${widthMode !== 'standard' ? 'case-visual--wide' : ''}`}
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[18px] bg-[#10110f] sm:rounded-[24px]">
                  <Image
                    src={image.url || 'https://picsum.photos/id/1/1200/800'}
                    alt={image.alt || 'Project visual'}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 92vw, 1280px"
                    className="object-cover"
                  />
                </div>
                {image.caption && (
                  <figcaption className="mt-3 max-w-2xl text-xs leading-relaxed text-[#f3f0e8]/50">
                    {image.caption}
                  </figcaption>
                )}
              </figure>
            );
          }

          case 'metrics': {
            return (
              <MetricsBlock
                key={block.id || index}
                content={content as MetricsBlockContent}
              />
            );
          }

          case 'quote': {
            const quote = content as QuoteBlockContent;
            return (
              <blockquote
                key={block.id || index}
                className="glass rounded-[24px] p-6 sm:p-8 my-8 border-l-4 border-l-[#ff5a1f] border-t border-r border-b border-[#f3f0e8]/10"
              >
                <p className="text-lg sm:text-xl md:text-2xl italic font-medium leading-relaxed text-[#f3f0e8]">
                  &ldquo;{quote.quote}&rdquo;
                </p>
                {quote.attribution && (
                  <cite className="block mt-4 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#ff5a1f] not-italic">
                    {quote.attribution} {quote.role ? `(${quote.role})` : ''}
                  </cite>
                )}
              </blockquote>
            );
          }

          case 'gallery': {
            const gallery = content as GalleryBlockContent;
            const images = gallery.images || [];
            return (
              <div
                key={block.id || index}
                className="case-gallery case-visual--wide my-12 grid grid-cols-1 gap-3 sm:grid-cols-2"
              >
                {images.map((image, i) => (
                  <figure
                    key={`${image.url}-${i}`}
                    className={`group ${i === 0 && images.length > 2 ? 'sm:col-span-2' : ''}`}
                  >
                    <div className={`relative overflow-hidden rounded-[16px] bg-[#10110f] ${i === 0 && images.length > 2 ? 'aspect-[16/9]' : 'aspect-[4/3]'}`}>
                      <Image
                        src={image.url}
                        alt={image.alt || `Project gallery image ${i + 1}`}
                        fill
                        sizes={i === 0 && images.length > 2 ? '100vw' : '(max-width: 768px) 100vw, 50vw'}
                        className="object-cover transition duration-500 group-hover:scale-[1.02]"
                      />
                    </div>
                    {image.caption && (
                      <figcaption className="mt-2 text-xs leading-relaxed text-[#f3f0e8]/50">
                        {image.caption}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            );
          }

          case 'video': {
            const video = content as VideoBlockContent;
            return (
              <div
                key={block.id || index}
                className="case-visual--wide my-12 overflow-hidden rounded-[18px] border border-[#f3f0e8]/10 bg-[#10110f] sm:rounded-[24px]"
              >
                <div className="relative aspect-[16/9] rounded-[14px] sm:rounded-[22px] overflow-hidden bg-[#10110f]">
                  <video
                    controls
                    muted
                    playsInline
                    poster={video.poster}
                    preload="none"
                    className="h-full w-full object-cover"
                  >
                    <source src={video.url} type="video/mp4" />
                  </video>
                </div>
              </div>
            );
          }

          case 'list': {
            const list = content as ListBlockContent;
            const items = list.items || [];
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
            const link = content as LinkBlockContent;
            return (
              <div key={block.id || index} className="my-6">
                <a
                  href={link.url}
                  target={link.target || '_blank'}
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-[#f3f0e8]/20 bg-white/[0.04] px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#f3f0e8] hover:border-[#ff5a1f] hover:text-[#ff5a1f] hover:bg-[#ff5a1f]/10 transition min-h-[44px]"
                >
                  <span>{link.label || 'Open link'}</span>
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
