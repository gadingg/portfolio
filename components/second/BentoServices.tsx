'use client';

import React from 'react';
import { 
  Palette, 
  Code2, 
  TrendingUp, 
  Box, 
  Check, 
  ArrowRight,
  Sparkles,
  Layers,
  Zap
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export function BentoServices() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const services = [
    {
      id: 'uiux',
      icon: <Palette className="text-purple-500" size={24} />,
      title: 'UI/UX & Product Design',
      tagline: 'Interfaces that feel alive and convert.',
      deliverables: [
        'End-to-End Product Architecture',
        'Interactive Figma Design Systems',
        'Emil Kowalski-grade Fluid Physics',
        'Responsive Mobile-First Interfaces',
      ],
      badge: 'Core Expertise',
      accentBorder: 'hover:border-purple-500/50',
    },
    {
      id: 'webdev',
      icon: <Code2 className="text-emerald-500" size={24} />,
      title: 'Modern Web Engineering',
      tagline: 'Lightning fast Next.js & Framer builds.',
      deliverables: [
        'Next.js 15 & React 19 App Router',
        'Smooth Canvas & SVG Animations',
        'SEO & Performance 100/100 Lighthouse',
        'Clean, scalable TypeScript Codebase',
      ],
      badge: 'Full-Stack',
      accentBorder: 'hover:border-emerald-500/50',
    },
    {
      id: 'marcomm',
      icon: <TrendingUp className="text-amber-500" size={24} />,
      title: 'Meta Ads & Growth Strategy',
      tagline: 'High ROAS creative testing & funnel ops.',
      deliverables: [
        'High-Converting Ad Creative Sets',
        'Direct-Response Copywriting',
        'Funnel Architecture & Tracking',
        'Audience Segmentation & Meta Ads Scaling',
      ],
      badge: 'Revenue Focused',
      accentBorder: 'hover:border-amber-500/50',
    },
    {
      id: 'visual3d',
      icon: <Box className="text-sky-500" size={24} />,
      title: 'Visual Identity & 3D Assets',
      tagline: 'Distinctive brand assets & playful art.',
      deliverables: [
        'Claymorphism & 3D Isometric Assets',
        'Vector Iconography & Stickers',
        'Complete Brand Styleguides',
        'Motion Graphics & Lottie Animations',
      ],
      badge: 'Visual Taste',
      accentBorder: 'hover:border-sky-500/50',
    },
  ];

  return (
    <section id="creatie-services" className="relative py-20 px-4 sm:px-8 max-w-7xl mx-auto z-10">
      
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20 mb-3">
          <Sparkles size={12} />
          <span>What I Do</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight uppercase mb-4">
          END-TO-END CREATIVE & TECHNICAL CRAFT
        </h2>
        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">
          From initial discovery and brand identity to polished interactive code and revenue-generating campaigns.
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        {services.map((service) => (
          <div
            key={service.id}
            className={`p-8 rounded-3xl border transition-all duration-300 transform hover:-translate-y-1 shadow-lg ${service.accentBorder} ${
              isDark 
                ? 'bg-slate-900/80 border-slate-800/80 text-slate-100' 
                : 'bg-white/85 border-slate-200/80 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                {service.icon}
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20">
                {service.badge}
              </span>
            </div>

            <h3 className="text-2xl font-black mb-1">{service.title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium">
              {service.tagline}
            </p>

            <div className="space-y-2.5 pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
              {service.deliverables.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center flex-shrink-0">
                    <Check size={11} strokeWidth={3} />
                  </div>
                  <span className="text-slate-600 dark:text-slate-300 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Workflow Step Bar */}
      <div className={`p-6 sm:p-8 rounded-3xl border ${
        isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white/70 border-slate-200 shadow-sm'
      }`}>
        <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold mb-6 text-center">
          The 4-Step Seamless Execution Process
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { num: '01', title: 'Deep Discovery', desc: 'Understanding user needs, business goals, and strategic positioning.' },
            { num: '02', title: 'Creative Wireframe', desc: 'Rapid prototyping, layout architecture, and moodboard alignment.' },
            { num: '03', title: 'Interactive Build', desc: 'Translating design to high-performance code with fluid motion.' },
            { num: '04', title: 'Launch & Optimize', desc: 'Lighthouse audits, SEO setup, tracking, and ongoing conversions.' },
          ].map((step) => (
            <div key={step.num} className="flex flex-col">
              <span className="text-2xl font-black text-emerald-500 mb-1">{step.num}</span>
              <h5 className="font-extrabold text-sm mb-1">{step.title}</h5>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}
