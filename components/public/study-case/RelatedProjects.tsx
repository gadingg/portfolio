import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Project } from '@/types/portfolio';

export function RelatedProjects({ projects }: { projects: Project[] }) {
  if (!projects || projects.length === 0) return null;

  return (
    <section className="mt-20 border-t border-[#f3f0e8]/10 pt-12">
      <div className="section-label mb-3">More selected work</div>
      <h2 className="mb-8 text-2xl font-black tracking-[-0.04em] text-[#f3f0e8] sm:text-3xl lg:text-4xl">
        Keep exploring
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {projects.map((p) => (
          <Link
            key={p.id || p.slug}
            href={`/work/${p.slug}`}
            className="group flex flex-col justify-between border-t border-[#f3f0e8]/12 pt-4 transition duration-300 hover:border-[#ff5a1f]/60"
          >
            <div>
              <div className="relative mb-4 aspect-[16/10] w-full overflow-hidden rounded-[16px] bg-[#10110f]">
                <Image
                  src={p.cover_image_url || 'https://picsum.photos/id/60/600/400'}
                  alt={p.cover_image_alt || p.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 500px"
                  className="object-cover group-hover:scale-105 transition duration-500"
                  loading="lazy"
                />
              </div>
              <div className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#ff5a1f]">
                {p.category}
              </div>
              <h3 className="text-lg sm:text-xl font-black tracking-[-0.03em] text-[#f3f0e8] group-hover:text-[#ff5a1f] transition mt-1.5 leading-snug">
                {p.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#f3f0e8]/60 mt-2 line-clamp-2 leading-relaxed">
                {p.subtitle || p.description}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-[#f3f0e8]/10 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#f3f0e8]/80 group-hover:text-[#ff5a1f] transition">
              <span>View Case</span>
              <span aria-hidden="true" className="group-hover:translate-x-1 transition duration-300">↗</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
