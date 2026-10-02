import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Project } from '@/types/portfolio';

export function NextProjectNav({ nextProject }: { nextProject: Project | null }) {
  if (!nextProject) return null;

  return (
    <section className="my-16 border-y border-[#f3f0e8]/12 py-8 sm:py-10">
      <Link
        href={`/work/${nextProject.slug}`}
        className="group grid items-center gap-7 sm:grid-cols-[minmax(0,1fr)_minmax(240px,0.72fr)]"
      >
        <div>
          <div className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#ff5a1f]">
            Next project
          </div>
          <h3 className="mt-2 text-2xl font-black tracking-[-0.04em] text-[#f3f0e8] transition group-hover:text-[#ff5a1f] sm:text-3xl">
            {nextProject.title}
          </h3>
          {nextProject.subtitle && (
            <p className="mt-1 text-xs font-medium text-[#f3f0e8]/55 sm:text-sm">
              {nextProject.subtitle}
            </p>
          )}
          <span className="mt-6 inline-flex min-h-[44px] items-center border-b border-[#ff5a1f] text-xs font-bold uppercase tracking-wider text-[#f3f0e8] transition group-hover:text-[#ff5a1f]">
            Open project
          </span>
        </div>
        <div className="relative aspect-[16/10] overflow-hidden rounded-[18px] bg-[#10110f]">
          <Image
            src={nextProject.cover_image_url}
            alt={nextProject.cover_image_alt || nextProject.title}
            fill
            sizes="(max-width: 640px) 100vw, 40vw"
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        </div>
      </Link>
    </section>
  );
}
