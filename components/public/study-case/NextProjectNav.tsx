import React from 'react';
import Link from 'next/link';
import { Project } from '@/types/portfolio';

export function NextProjectNav({ nextProject }: { nextProject: Project | null }) {
  if (!nextProject) return null;

  return (
    <div className="glass rounded-[28px] sm:rounded-[36px] p-6 sm:p-10 my-16 border border-[#f3f0e8]/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:border-[#ff5a1f]/40 transition group">
      <div>
        <div className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#ff5a1f]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#ff5a1f]" />
          Next Case Study
        </div>
        <h3 className="text-2xl sm:text-3xl font-black tracking-[-0.04em] text-[#f3f0e8] group-hover:text-[#ff5a1f] transition mt-2">
          {nextProject.title}
        </h3>
        {nextProject.subtitle && (
          <p className="text-xs sm:text-sm text-[#f3f0e8]/55 mt-1 font-medium">
            {nextProject.subtitle}
          </p>
        )}
      </div>

      <Link
        href={`/work/${nextProject.slug}`}
        className="inline-flex items-center gap-2 rounded-full border border-[#f3f0e8]/20 bg-white/[0.04] px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-[#f3f0e8] group-hover:border-[#ff5a1f] group-hover:bg-[#ff5a1f] group-hover:text-[#060706] transition shrink-0 min-h-[44px]"
      >
        <span>View Case</span>
        <span aria-hidden="true" className="group-hover:translate-x-0.5 transition">↗</span>
      </Link>
    </div>
  );
}
