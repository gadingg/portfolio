'use client';

import React from 'react';
import { 
  ArrowUpRight, 
  Sparkles, 
  ExternalLink, 
  Layers 
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import styles from '@/app/second/second.module.css';

export function ProjectsShowcase() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const projects = [
    {
      id: 'patos-hub',
      title: 'Patos Creator & Listing Platform',
      category: 'Full-Stack Web App',
      rotation: '-rotate-3',
      clipColor: '#ef4444', // Red paperclip
      bgGradient: 'from-sky-500 via-indigo-600 to-slate-900',
      description: 'Dynamic creator directory with live search filters, realtime updates, and verified creator badges.',
      tags: ['Next.js 15', 'TypeScript', 'Tailwind', 'Realtime Hub'],
      metrics: '10k+ Monthly Visits',
      link: '#',
    },
    {
      id: 'lumina-3d',
      title: 'Lumina 3D Creative Studio',
      category: 'UI/UX & Framer Build',
      rotation: 'rotate-2',
      clipColor: '#22c55e', // Green paperclip
      bgGradient: 'from-purple-600 via-pink-600 to-slate-900',
      description: 'Interactive brand universe featuring physics-based springs, 3D interactive assets, and micro-delight.',
      tags: ['Framer', 'Blender 3D', 'Design Systems'],
      metrics: 'AOTD Winner',
      link: '#',
    },
    {
      id: 'cherry-editorial',
      title: 'Cherry Editorial Magazine',
      category: 'Brand & Visual Identity',
      rotation: '-rotate-2',
      clipColor: '#eab308', // Yellow paperclip
      bgGradient: 'from-pink-500 via-rose-600 to-slate-900',
      description: 'Playful editorial showcase with bespoke typography, grid breaking aesthetics, and custom motion.',
      tags: ['Typography', 'Art Direction', 'Editorial'],
      metrics: 'Featured on Dribbble',
      link: '#',
    },
    {
      id: 'meta-growth',
      title: 'Meta Ads Conversion Engine',
      category: 'Marketing Communication',
      rotation: 'rotate-3',
      clipColor: '#3b82f6', // Blue paperclip
      bgGradient: 'from-amber-500 via-orange-600 to-slate-900',
      description: 'End-to-end creative ad testing system with custom funnel landers and conversion analytics.',
      tags: ['Meta Ads', 'Funnel Design', 'Conversion Copy'],
      metrics: '4.8x Average ROAS',
      link: '#',
    },
    {
      id: 'vivako-packaging',
      title: 'Vivako Botanical Packaging',
      category: 'Packaging & 3D Renders',
      rotation: '-rotate-1',
      clipColor: '#f97316', // Orange paperclip
      bgGradient: 'from-emerald-600 via-teal-700 to-slate-900',
      description: 'Sustainable product packaging line with tactile embossing, custom patterns, and realistic 3D mockups.',
      tags: ['Packaging', '3D Visuals', 'Illustration'],
      metrics: '100k+ Units Sold',
      link: '#',
    },
  ];

  return (
    <section id="creatie-projects" className="relative py-28 px-6 sm:px-12 max-w-7xl mx-auto z-10">
      
      {/* Section Header with Sticker */}
      <div className={styles.sectionHeader}>
        <div className={`${styles.pillBadge} bg-[#bae6fd] text-[#0369a1] border-2 border-[#7dd3fc]`}>
          <span>✦ 01 - WORK</span>
        </div>
        <h2 className={styles.sectionTitle}>
          PROJECTS THAT TELL STORIES
        </h2>
      </div>

      {/* Tilted Cards Grid with Paperclips */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 sm:gap-12 pt-4">
        {projects.map((project, idx) => (
          <div
            key={project.id}
            className={`group relative ${styles.stickyCard} ${project.rotation} ${
              idx === 0 || idx === 3 ? 'lg:translate-y-4' : ''
            }`}
          >
            {/* SVG Colored Paperclip Pin */}
            <div className={styles.paperclipWrap}>
              <svg width="28" height="52" viewBox="0 0 28 52" fill="none">
                <path
                  d="M14 6C8 6 4 10 4 16V38C4 44 8 48 14 48C20 48 24 44 24 38V12C24 8 21 4 17 4C13 4 10 7 10 11V36C10 39 12 41 14 41C16 41 18 39 18 36V14"
                  stroke={project.clipColor}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* macOS Window Title Bar */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
              </div>
              <span className="text-[11px] font-mono font-bold text-slate-400">
                {project.category}
              </span>
            </div>

            {/* Mockup Visual Banner */}
            <div className={`h-48 sm:h-52 w-full rounded-xl bg-gradient-to-br ${project.bgGradient} p-5 flex flex-col justify-between overflow-hidden relative mb-5 shadow-inner`}>
              <div className="flex items-center justify-between z-10">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-white backdrop-blur-md border border-white/30">
                  {project.metrics}
                </span>

                <div className="w-8 h-8 rounded-full bg-white/20 group-hover:bg-white/40 backdrop-blur-md flex items-center justify-center text-white transition-transform group-hover:rotate-45">
                  <ArrowUpRight size={16} />
                </div>
              </div>

              {/* Decorative Window Silhouette Mockup */}
              <div className="absolute -bottom-6 -right-6 w-52 h-36 rounded-xl bg-white/15 border border-white/25 backdrop-blur-sm transform rotate-6 group-hover:rotate-2 group-hover:scale-105 transition-all duration-300 p-3 flex flex-col justify-between">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-white/60" />
                  <div className="w-2 h-2 rounded-full bg-white/60" />
                  <div className="w-2 h-2 rounded-full bg-white/60" />
                </div>
                <div className="space-y-1.5">
                  <div className="w-3/4 h-2.5 rounded bg-white/40" />
                  <div className="w-1/2 h-2 rounded bg-white/30" />
                </div>
                <div className="w-10 h-4 rounded bg-white/40" />
              </div>

              <div className="z-10">
                <h4 className="text-white font-black text-lg tracking-tight drop-shadow-sm">
                  {project.title}
                </h4>
              </div>
            </div>

            {/* Bottom Card Content */}
            <div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium mb-4 leading-relaxed">
                {project.description}
              </p>

              {/* Tag Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

          </div>
        ))}
      </div>

    </section>
  );
}
