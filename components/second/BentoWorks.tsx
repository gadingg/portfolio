'use client';

import React, { useState } from 'react';
import { 
  ArrowUpRight, 
  Sparkles, 
  Layers, 
  ExternalLink, 
  Code2, 
  Flame,
  LayoutGrid,
  Laptop,
  Smartphone,
  CheckCircle2
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export function BentoWorks() {
  const { theme } = useTheme();
  const [filter, setFilter] = useState<'all' | 'web' | 'uiux' | 'brand'>('all');

  const isDark = theme === 'dark';

  const projects = [
    {
      id: 'patos-hub',
      title: 'Patos Listing & Creator Platform',
      category: 'web',
      categoryLabel: 'Full-Stack Web App',
      badgeColor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      description: 'Centralized directory and real-time marketing platform with dynamic filters, verification badges, and automated workflows.',
      tags: ['Next.js 15', 'TypeScript', 'Tailwind', 'Realtime Hub'],
      metrics: '10k+ Monthly Visits',
      link: '#',
      featured: true,
      gradient: 'from-emerald-600/90 via-teal-700/80 to-slate-900',
    },
    {
      id: 'lumina-ui',
      title: 'Lumina Creative Studio',
      category: 'uiux',
      categoryLabel: 'UI/UX & 3D Exploration',
      badgeColor: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
      description: 'Immersive agency landing page featuring fluid physics, custom 3D assets, and interactive case study transitions.',
      tags: ['Framer', 'Design Systems', '3D Blender', 'Figma'],
      metrics: 'Award-winning Design',
      link: '#',
      featured: false,
      gradient: 'from-purple-700/90 via-indigo-800/80 to-slate-900',
    },
    {
      id: 'pulse-ads',
      title: 'Meta Ads Conversion Engine',
      category: 'brand',
      categoryLabel: 'Marketing & Marcomm',
      badgeColor: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
      description: 'End-to-end creative ad system that generated high ROAS for high-ticket SaaS and e-commerce campaigns.',
      tags: ['Meta Ads', 'Copywriting', 'Creative Testing', 'Analytics'],
      metrics: '4.8x Average ROAS',
      link: '#',
      featured: false,
      gradient: 'from-amber-600/90 via-rose-700/80 to-slate-900',
    },
    {
      id: 'nexus-design-tokens',
      title: 'Nexus Multi-Brand System',
      category: 'uiux',
      categoryLabel: 'Design Engineering',
      badgeColor: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30',
      description: 'Comprehensive UI token library and component master set designed for high velocity engineering teams.',
      tags: ['Design Tokens', 'Tailwind CSS', 'Accessible UI', 'Figma'],
      metrics: '150+ Components',
      link: '#',
      featured: false,
      gradient: 'from-sky-600/90 via-blue-800/80 to-slate-900',
    },
  ];

  const filteredProjects = filter === 'all' 
    ? projects 
    : projects.filter(p => p.category === filter);

  return (
    <section id="creatie-projects" className="relative py-20 px-4 sm:px-8 max-w-7xl mx-auto z-10">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/20">
              Selected Works
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight uppercase">
            CRAFTED WITH TASTE & PRECISION
          </h2>
        </div>

        {/* Filter Pills */}
        <div className={`flex items-center gap-1.5 p-1.5 rounded-2xl border backdrop-blur-xl ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200 shadow-sm'
        }`}>
          {[
            { id: 'all', label: 'All Projects' },
            { id: 'web', label: 'Web Apps' },
            { id: 'uiux', label: 'UI/UX' },
            { id: 'brand', label: 'Marcomm' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === tab.id
                  ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className={`group relative rounded-3xl border overflow-hidden transition-all duration-300 transform hover:-translate-y-1.5 shadow-xl ${
              isDark 
                ? 'bg-slate-900/85 border-slate-800/80 text-slate-100 hover:border-slate-700' 
                : 'bg-white/90 border-slate-200/80 text-slate-900 hover:border-slate-300'
            }`}
          >
            {/* Top Visual Banner */}
            <div className={`relative h-56 sm:h-64 w-full bg-gradient-to-br ${project.gradient} p-6 flex flex-col justify-between overflow-hidden`}>
              
              {/* Top Row in Banner */}
              <div className="flex items-center justify-between z-10">
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border backdrop-blur-md ${project.badgeColor} bg-white/10 dark:bg-black/20 text-white`}>
                  {project.categoryLabel}
                </span>

                <div className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md flex items-center justify-center text-white transition-all transform group-hover:rotate-45">
                  <ArrowUpRight size={18} />
                </div>
              </div>

              {/* Decorative Geometric Mockup Silhouette */}
              <div className="absolute -bottom-6 -right-6 w-60 h-44 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm transform rotate-6 group-hover:rotate-3 group-hover:scale-105 transition-all duration-500 p-4 flex flex-col justify-between shadow-2xl">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
                </div>
                <div className="space-y-2">
                  <div className="w-3/4 h-3 rounded bg-white/30" />
                  <div className="w-1/2 h-2.5 rounded bg-white/20" />
                </div>
                <div className="flex gap-2">
                  <div className="w-10 h-6 rounded bg-white/30" />
                  <div className="w-14 h-6 rounded bg-emerald-400/80" />
                </div>
              </div>

              {/* Metric Tag */}
              <div className="z-10 flex items-center gap-2 text-xs font-bold text-white/90">
                <Sparkles size={14} className="text-amber-300" />
                <span>{project.metrics}</span>
              </div>
            </div>

            {/* Bottom Card Content */}
            <div className="p-6 sm:p-7">
              <h3 className="text-xl sm:text-2xl font-black mb-2 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">
                {project.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                {project.description}
              </p>

              {/* Tech Tags */}
              <div className="flex flex-wrap items-center gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold border ${
                      isDark
                        ? 'bg-slate-800/80 border-slate-700/60 text-slate-300'
                        : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}
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
