'use client';

import React from 'react';
import { 
  ArrowUpRight, 
  Sparkles, 
  Twitter, 
  Linkedin, 
  Instagram, 
  Github,
  Globe
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import styles from '@/app/second/second.module.css';

interface FooterCTAProps {
  onOpenContact: () => void;
}

export function FooterCTA({ onOpenContact }: FooterCTAProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <footer className="relative w-full pt-16 z-10 select-none">
      
      {/* ── PANORAMIC HILL FOOTER BANNER ──────────────────── */}
      <div className="max-w-7xl mx-auto px-6 sm:px-12 mb-16">
        <div 
          className={`relative w-full min-h-[460px] sm:min-h-[520px] rounded-3xl sm:rounded-[36px] overflow-hidden p-8 sm:p-14 flex flex-col justify-between shadow-2xl border ${
            isDark 
              ? 'border-slate-800 bg-[#0a1128]' 
              : 'border-white/80 bg-gradient-to-b from-[#64b5f6] to-[#43a047]'
          }`}
        >
          {/* Background Landscape Simulation inside Banner */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Sun/Moon glow */}
            <div 
              className={`absolute top-[-50px] right-[10%] w-[320px] h-[320px] rounded-full ${
                isDark 
                  ? 'bg-indigo-500/20 blur-3xl' 
                  : 'bg-yellow-200/40 blur-3xl'
              }`} 
            />

            {/* Rolling Hills Vector Overlay */}
            <svg 
              className="absolute bottom-0 left-0 w-full h-[65%]" 
              viewBox="0 0 1440 380" 
              fill="none" 
              preserveAspectRatio="none"
            >
              <path 
                d="M0,140 C320,50 640,220 960,110 C1200,30 1360,120 1440,90 L1440,380 L0,380 Z" 
                fill={isDark ? '#090e24' : '#4d7c0f'} 
              />
              <path 
                d="M0,180 C280,260 600,100 880,190 C1140,270 1320,130 1440,160 L1440,380 L0,380 Z" 
                fill={isDark ? '#040714' : '#365314'} 
              />
            </svg>
          </div>

          {/* Top Row of Banner: Socials & Connect Note */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 z-10 w-full">
            {/* Social Icons Pill */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 dark:bg-black/30 backdrop-blur-xl border border-white/30 text-white shadow-lg">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="p-1.5 hover:scale-110 transition-transform"
                title="Twitter / X"
              >
                <Twitter size={16} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="p-1.5 hover:scale-110 transition-transform"
                title="LinkedIn"
              >
                <Linkedin size={16} />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="p-1.5 hover:scale-110 transition-transform"
                title="GitHub"
              >
                <Github size={16} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="p-1.5 hover:scale-110 transition-transform"
                title="Instagram"
              >
                <Instagram size={16} />
              </a>
            </div>

            {/* Connect Tagline */}
            <div className="text-left sm:text-right text-white/90 font-bold text-xs sm:text-sm drop-shadow-sm">
              <p className="font-mono text-[11px] uppercase tracking-wider text-white/70">— LET&apos;S CONNECT</p>
              <p>Collaboration or just a casual coffee chat.</p>
            </div>
          </div>

          {/* Bottom Row of Banner: Headline & CTA Button */}
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 z-10 w-full pt-16">
            
            {/* Big Headline with Sticker */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#e9d5ff] border-2 border-[#d8b4fe] text-[#581c87] font-black text-xs uppercase tracking-wider shadow-lg transform -rotate-2 mb-3">
                <Sparkles size={13} />
                <span>Start a Project</span>
              </div>

              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase text-white tracking-tight leading-[1.05] drop-shadow-[0_8px_20px_rgba(0,0,0,0.35)]">
                LET&apos;S BUILD<br />
                SOMETHING<br />
                MEMORABLE
              </h2>
            </div>

            {/* Direct Action Button */}
            <button
              onClick={onOpenContact}
              className="px-8 py-4 rounded-full text-sm sm:text-base font-black bg-white text-slate-950 hover:bg-slate-100 shadow-2xl flex items-center gap-2.5 transform hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <span>Get in Touch</span>
              <ArrowUpRight size={18} strokeWidth={2.5} />
            </button>

          </div>
        </div>
      </div>

      {/* ── RUNNING MARQUEE TICKER AT BOTTOM ──────────────── */}
      <div className={styles.marqueeWrap}>
        <div className={styles.marqueeTrack}>
          <div className="flex items-center gap-8 mx-4">
            <span>✦ GADING UTAMA</span>
            <span>✦ PRODUCT DESIGNER</span>
            <span>✦ CREATIVE TECH & WEB APPS</span>
            <span>✦ MARKETING COMMUNICATION</span>
            <span>✦ AVAILABLE WORLDWIDE REMOTE 2026</span>
          </div>
          <div className="flex items-center gap-8 mx-4" aria-hidden="true">
            <span>✦ GADING UTAMA</span>
            <span>✦ PRODUCT DESIGNER</span>
            <span>✦ CREATIVE TECH & WEB APPS</span>
            <span>✦ MARKETING COMMUNICATION</span>
            <span>✦ AVAILABLE WORLDWIDE REMOTE 2026</span>
          </div>
        </div>
      </div>

    </footer>
  );
}
