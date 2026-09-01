'use client';

import React from 'react';
import { 
  ArrowUp, 
  ArrowUpRight, 
  Sparkles, 
  Heart,
  Globe,
  Mail,
  Github,
  Linkedin,
  Twitter,
  Instagram
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface SecondFooterProps {
  onOpenContact: () => void;
}

export function SecondFooter({ onOpenContact }: SecondFooterProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative pt-16 pb-32 px-4 sm:px-8 max-w-7xl mx-auto z-10">
      
      {/* ── RUNNING MARQUEE BANNER ──────────────────────── */}
      <div className="relative w-full overflow-hidden py-4 rounded-3xl bg-emerald-500 text-slate-950 font-black text-sm uppercase tracking-wider mb-16 shadow-lg rotate-[-1deg] hover:rotate-0 transition-transform">
        <div className="flex whitespace-nowrap animate-marquee">
          <div className="flex items-center gap-6 mx-4">
            <span>✦ AVAILABLE FOR SELECT PROJECTS</span>
            <span>✦ UI/UX DESIGN & ENGINEERING</span>
            <span>✦ FRAMER & NEXT.JS BUILDS</span>
            <span>✦ PERFORMANCE MARKETING</span>
            <span>✦ CRAFTED WITH OBSESSIVE DETAIL</span>
          </div>
          <div className="flex items-center gap-6 mx-4" aria-hidden="true">
            <span>✦ AVAILABLE FOR SELECT PROJECTS</span>
            <span>✦ UI/UX DESIGN & ENGINEERING</span>
            <span>✦ FRAMER & NEXT.JS BUILDS</span>
            <span>✦ PERFORMANCE MARKETING</span>
            <span>✦ CRAFTED WITH OBSESSIVE DETAIL</span>
          </div>
        </div>
      </div>

      {/* ── MAIN CTA CARD ───────────────────────────────── */}
      <div className={`p-8 sm:p-14 rounded-3xl border text-center relative overflow-hidden shadow-2xl mb-12 ${
        isDark ? 'bg-slate-900/90 border-slate-800 text-slate-100' : 'bg-white/90 border-slate-200 text-slate-900'
      }`}>
        
        {/* Ambient background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-500 mb-4">
            Ready to get started?
          </span>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight uppercase mb-6 leading-tight">
            LET&apos;S CREATE SOMETHING PEOPLE TALK ABOUT.
          </h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
            Whether you need a complete product redesign, a high-converting web application, or a scalable ad creative system — I&apos;m ready.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onOpenContact}
              className="px-8 py-3.5 rounded-full text-sm font-extrabold bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-500/30 flex items-center gap-2 transform hover:scale-105 active:scale-95 transition-all"
            >
              <span>Get in Touch</span>
              <ArrowUpRight size={16} />
            </button>

            <button
              onClick={scrollToTop}
              className={`px-6 py-3.5 rounded-full text-sm font-extrabold border transition-all flex items-center gap-2 ${
                isDark ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-slate-100 border-slate-300 hover:bg-slate-200'
              }`}
            >
              <span>Back to Top</span>
              <ArrowUp size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ── FOOTER BOTTOM ROW ───────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-medium pt-6 border-t border-slate-200/40 dark:border-slate-800/60">
        <div className="flex items-center gap-2">
          <span>© 2026 Gading Utama.</span>
          <span>•</span>
          <span>Inspired by Creatie®</span>
        </div>

        <div className="flex items-center gap-4">
          <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-emerald-500 transition-colors">GitHub</a>
          <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-emerald-500 transition-colors">LinkedIn</a>
          <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-emerald-500 transition-colors">Twitter / X</a>
          <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-emerald-500 transition-colors">Instagram</a>
        </div>
      </div>

    </footer>
  );
}
