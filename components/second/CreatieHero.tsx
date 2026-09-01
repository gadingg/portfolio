'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowUpRight, 
  Layers, 
  Palette, 
  Code2, 
  Star, 
  Flame, 
  Check 
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface CreatieHeroProps {
  onOpenContact: () => void;
}

export function CreatieHero({ onOpenContact }: CreatieHeroProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Mouse pupil tracking state
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 8; // Max 4px offset
      const y = (e.clientY / innerHeight - 0.5) * 8;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className="relative min-h-[95vh] sm:min-h-screen flex flex-col justify-between pt-10 sm:pt-14 pb-28 px-6 sm:px-12 max-w-7xl mx-auto z-10 select-none">
      
      {/* ── TOP BAR: PROFILE BADGE & ANIMATED EYES ─────── */}
      <div className="flex items-center justify-between w-full">
        
        {/* Profile Card Pill (Top Left) */}
        <div 
          className={`flex items-center gap-3 px-4 py-2.5 rounded-full border backdrop-blur-xl shadow-lg transition-all duration-300 ${
            isDark 
              ? 'bg-slate-900/80 border-slate-700/60 text-slate-100' 
              : 'bg-white/85 border-white/90 text-slate-900 shadow-slate-200/50'
          }`}
        >
          {/* Avatar with Ring */}
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 via-rose-400 to-indigo-500 p-[2px] shadow-sm">
              <div className="w-full h-full rounded-full bg-slate-900 overflow-hidden flex items-center justify-center font-black text-xs text-white">
                GU
              </div>
            </div>
            {/* Pulsing Status Dot */}
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900">
              <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
            </span>
          </div>

          {/* Name & Role */}
          <div className="flex flex-col pr-1">
            <div className="flex items-center gap-2">
              <span className="font-black text-xs sm:text-sm tracking-tight">GADING UTAMA</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Online
              </span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
              Product Designer & Creative Tech
            </span>
          </div>
        </div>

        {/* Top Right: Animated Doodle Eyes & Available Sticker */}
        <div className="flex items-center gap-3">
          {/* Animated Doodle Eyes */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white border-2 border-slate-900 shadow-lg transform rotate-6 hover:rotate-0 transition-transform">
            <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-900 relative flex items-center justify-center overflow-hidden">
              <div 
                className="w-2.5 h-2.5 rounded-full bg-slate-950 transition-transform duration-75"
                style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}
              />
            </div>
            <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-900 relative flex items-center justify-center overflow-hidden">
              <div 
                className="w-2.5 h-2.5 rounded-full bg-slate-950 transition-transform duration-75"
                style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}
              />
            </div>
          </div>

          {/* Contact Trigger Button */}
          <button
            onClick={onOpenContact}
            className={`hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black border shadow-md transition-all duration-300 transform hover:scale-105 active:scale-95 ${
              isDark
                ? 'bg-white text-slate-950 border-white hover:bg-slate-100 shadow-white/10'
                : 'bg-slate-950 text-white border-slate-900 hover:bg-slate-800'
            }`}
          >
            <span>Let&apos;s Talk</span>
            <ArrowUpRight size={14} />
          </button>
        </div>

      </div>

      {/* ── CENTER: PLAYFUL DISPLAY HEADLINE WITH INLINE STICKERS ── */}
      <div className="my-auto py-10 sm:py-16 text-center z-10 max-w-5xl mx-auto">
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[5.75rem] font-black tracking-tight leading-[1.08] uppercase text-white drop-shadow-[0_12px_28px_rgba(0,0,0,0.35)]">
          <span>DESIGN THAT</span>
          <br />
          <span>MAKES</span>
          
          {/* Lime Green Sticker */}
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#d9f99d] border-2 border-[#bef264] text-[#14532d] font-black text-xs sm:text-sm md:text-base tracking-tight shadow-xl transform -rotate-3 hover:rotate-0 hover:scale-110 transition-all duration-200 cursor-pointer align-middle mx-2 my-1 drop-shadow-md">
            <Sparkles size={14} className="animate-spin-slow text-lime-700" />
            <span>UI/UX Design</span>
          </span>

          <br />
          <span>PEOPLE</span>

          {/* Purple Sticker */}
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#e9d5ff] border-2 border-[#d8b4fe] text-[#581c87] font-black text-xs sm:text-sm md:text-base tracking-tight shadow-xl transform rotate-4 hover:rotate-0 hover:scale-110 transition-all duration-200 cursor-pointer align-middle mx-1.5 my-1 drop-shadow-md">
            <Star size={14} className="fill-purple-600 text-purple-600" />
            <span>Illustration</span>
          </span>

          {/* Lavender/Blue Sticker */}
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#c7d2fe] border-2 border-[#a5b4fc] text-[#1e1b4b] font-black text-xs sm:text-sm md:text-base tracking-tight shadow-xl transform -rotate-2 hover:rotate-0 hover:scale-110 transition-all duration-200 cursor-pointer align-middle mx-1.5 my-1 drop-shadow-md">
            <Code2 size={14} className="text-indigo-800" />
            <span>3D Design</span>
          </span>

          <br />
          <span>LOOK TWICE</span>
        </h1>
      </div>

      {/* ── BOTTOM ROW: TAGLINE & PROJECT TEASER STACK ── */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 w-full">
        
        {/* Left Tagline */}
        <div className="max-w-sm">
          <p className="text-sm sm:text-base font-bold text-white/95 leading-snug drop-shadow-md">
            — Not just visuals.<br />
            I make digital things<br />
            look alive
          </p>
        </div>

        {/* Right Project Teaser Card */}
        <div 
          onClick={() => {
            const el = document.getElementById('creatie-projects');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="group relative cursor-pointer select-none"
        >
          {/* Stack offset layer */}
          <div className="absolute inset-0 bg-white/20 rounded-2xl transform rotate-3 translate-x-2 translate-y-2 backdrop-blur-sm transition-transform group-hover:rotate-6 group-hover:translate-x-3 group-hover:translate-y-3" />

          {/* Main Card */}
          <div 
            className={`relative p-4 rounded-2xl border backdrop-blur-2xl shadow-xl transition-all duration-300 group-hover:-translate-y-1 ${
              isDark 
                ? 'bg-slate-900/90 border-slate-700/80 text-slate-100' 
                : 'bg-white/90 border-white text-slate-900 shadow-slate-300/40'
            }`}
          >
            <div className="flex items-center justify-between gap-6 mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                Featured Case Study
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/20 flex items-center gap-1">
                <Flame size={10} />
                <span>New</span>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center text-white font-black text-xs shadow-md">
                PATOS
              </div>
              <div>
                <h4 className="text-sm font-extrabold group-hover:text-emerald-500 transition-colors flex items-center gap-1">
                  Patos Listing Platform
                  <ArrowUpRight size={14} className="transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </h4>
                <p className="text-xs text-slate-400 font-medium">Marketing & Realtime CMS</p>
              </div>
            </div>
          </div>
        </div>

      </div>

    </section>
  );
}
