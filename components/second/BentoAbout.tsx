'use client';

import React from 'react';
import { 
  Sparkles, 
  Award, 
  Users, 
  Clock, 
  HeartHandshake, 
  Compass, 
  Terminal,
  ArrowUpRight
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface BentoAboutProps {
  onOpenContact: () => void;
}

export function BentoAbout({ onOpenContact }: BentoAboutProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const tools = [
    { name: 'Figma', category: 'Design Systems' },
    { name: 'Framer', category: 'Interactive Web' },
    { name: 'Next.js 15', category: 'Modern Web' },
    { name: 'React 19', category: 'Architecture' },
    { name: 'TypeScript', category: 'Type Safety' },
    { name: 'Tailwind CSS', category: 'Styling' },
    { name: 'Meta Ads Manager', category: 'Growth & Marcomm' },
    { name: 'Blender 3D', category: 'Visual Assets' },
    { name: 'Supabase', category: 'Cloud Data' },
  ];

  return (
    <section id="creatie-about" className="relative py-20 px-4 sm:px-8 max-w-7xl mx-auto z-10">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              About The Creator
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight uppercase">
            BRIDGING DESIGN, CODE & CONVERSION
          </h2>
        </div>
      </div>

      {/* Bento Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Main Story (Col span 2) */}
        <div className={`lg:col-span-2 p-8 sm:p-10 rounded-3xl border flex flex-col justify-between shadow-xl ${
          isDark ? 'bg-slate-900/85 border-slate-800 text-slate-100' : 'bg-white/90 border-slate-200 text-slate-900'
        }`}>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-500 mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Marketing Communication & Creative Engineer</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black leading-snug mb-4">
              Hi, I&apos;m Gading — I help forward-thinking founders and teams build digital experiences that command attention.
            </h3>

            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              I specialize in merging aesthetic craft with technical execution and marketing psychology. Rather than separating design from code or traffic from conversions, I connect the entire loop: striking visual identity, fluid physics-based interfaces, and high-converting marketing funnels.
            </p>

            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 leading-relaxed">
              When software feels effortless, responsive, and tactile, users don&apos;t just use it — they love it and recommend it.
            </p>
          </div>

          {/* Core Philosophy Quote Pill */}
          <div className={`mt-8 p-4 rounded-2xl border flex items-center gap-3 ${
            isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
          }`}>
            <Sparkles className="text-amber-400 flex-shrink-0" size={20} />
            <p className="text-xs sm:text-sm font-semibold italic text-slate-600 dark:text-slate-300">
              &quot;Good taste is leverage. Invisible details compound into software that feels undeniably well-made.&quot;
            </p>
          </div>
        </div>

        {/* Card 2: Stats Bento (Col span 1) */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { value: '40+', label: 'Shipped Projects', icon: <Award size={18} className="text-amber-500" /> },
            { value: '5+ Yrs', label: 'Design & Code', icon: <Clock size={18} className="text-sky-500" /> },
            { value: '99%', label: 'Satisfaction', icon: <HeartHandshake size={18} className="text-rose-500" /> },
            { value: '4.8x', label: 'Avg Ads ROAS', icon: <Users size={18} className="text-emerald-500" /> },
          ].map((stat, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-3xl border flex flex-col justify-between shadow-md ${
                isDark ? 'bg-slate-900/80 border-slate-800 text-slate-100' : 'bg-white/85 border-slate-200 text-slate-900'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-slate-500/10 flex items-center justify-center mb-3">
                {stat.icon}
              </div>
              <div>
                <span className="text-3xl font-black block tracking-tight">{stat.value}</span>
                <span className="text-xs font-semibold text-slate-400">{stat.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Card 3: Toolkit & Stack (Col span 3) */}
        <div className={`lg:col-span-3 p-8 rounded-3xl border shadow-xl ${
          isDark ? 'bg-slate-900/80 border-slate-800 text-slate-100' : 'bg-white/85 border-slate-200 text-slate-900'
        }`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h4 className="text-lg font-black uppercase">Battle-Tested Stack & Tools</h4>
              <p className="text-xs text-slate-400">The modern technologies and design software I use daily.</p>
            </div>

            <button
              onClick={onOpenContact}
              className="px-4 py-2 rounded-full text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-md flex items-center gap-1.5 transition-all"
            >
              <span>Hire For Next Sprint</span>
              <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {tools.map((tool) => (
              <div
                key={tool.name}
                className={`p-3.5 rounded-2xl border flex flex-col justify-center transition-all hover:scale-105 ${
                  isDark 
                    ? 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800' 
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="text-sm font-extrabold">{tool.name}</span>
                <span className="text-[10px] text-slate-400 font-mono">{tool.category}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </section>
  );
}
