import React from 'react';
import { MetricsBlockContent } from '@/types/portfolio';

export function MetricsBlock({ content }: { content: MetricsBlockContent }) {
  if (!content?.items || content.items.length === 0) return null;

  return (
    <section aria-label="Project outcomes" className="case-outcomes my-12 border-y border-[#f3f0e8]/15 py-8 sm:py-10">
      <div className="grid grid-cols-1 gap-7 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-[#f3f0e8]/12">
        {content.items.map((item, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${idx > 0 ? 'pt-4 sm:pt-0 sm:pl-6' : ''}`}
          >
            <span className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-[-0.04em] text-[#ff5a1f] leading-none">
              {item.value}
            </span>
            <span className="text-xs sm:text-sm font-extrabold tracking-[0.1em] uppercase text-[#f3f0e8] mt-3">
              {item.label}
            </span>
            {item.description && (
              <span className="text-xs sm:text-sm text-[#f3f0e8]/60 mt-1.5 leading-relaxed">
                {item.description}
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
