import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ProjectArtwork } from './ProjectArtwork';
import { Project } from '@/types/portfolio';
import { projectPresentations } from '@/lib/project-presentation';

export function RelatedProjects({ projects }: { projects: Project[] }) {
  if (!projects || projects.length === 0) return null;

  return (
    <section className="mt-20 border-t border-[#f3f0e8]/10 pt-12">
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
              <div className="compact-art mb-4"><ProjectArtwork project={p} /></div>
              <h3 className="text-lg sm:text-xl font-black tracking-[-0.03em] text-[#f3f0e8] group-hover:text-[#ff5a1f] transition mt-1.5 leading-snug">
                {projectPresentations[p.slug]?.title || p.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#f3f0e8]/60 mt-2 line-clamp-2 leading-relaxed">
                {projectPresentations[p.slug]?.intro || p.subtitle || p.description}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-[#f3f0e8]/10 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#f3f0e8]/80 group-hover:text-[#ff5a1f] transition">
              <span>View case study</span>
              <ArrowRight className="icon" aria-hidden="true" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
