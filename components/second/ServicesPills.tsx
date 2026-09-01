'use client';

import React, { useState } from 'react';
import { 
  ArrowUpRight, 
  Sparkles, 
  Palette, 
  Code2, 
  Layers, 
  Box, 
  Compass, 
  Check, 
  Heart,
  Star
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import styles from '@/app/second/second.module.css';

export function ServicesPills() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const services = [
    {
      id: 'web-design',
      title: 'Website Design',
      tagline: 'High-converting, responsive landing pages & portals.',
      bgDay: '#fedcdd', // Coral Pink
      textDay: '#881337',
      borderDay: '#fca5a5',
      bgNight: 'rgba(244, 63, 94, 0.15)',
      textNight: '#fda4af',
      borderNight: 'rgba(244, 63, 94, 0.3)',
      icon: <Heart size={20} className="fill-rose-500 text-rose-500" />,
      items: ['Design Systems', 'Responsive Web', 'Conversion Copy', 'Lighthouse 100/100'],
    },
    {
      id: 'ui-ux',
      title: 'UI/UX Design',
      tagline: 'Tactile, fluid interfaces with micro-interactions.',
      bgDay: '#bbdafe', // Sky Blue
      textDay: '#1e3a8a',
      borderDay: '#93c5fd',
      bgNight: 'rgba(59, 130, 246, 0.15)',
      textNight: '#93c5fd',
      borderNight: 'rgba(59, 130, 246, 0.3)',
      icon: <Compass size={20} className="text-blue-500" />,
      items: ['Figma Master Components', 'Apple WWDC Fluid Physics', 'Emil Kowalski Craft', 'Accessibility'],
    },
    {
      id: 'brand-identity',
      title: 'Brand Identity',
      tagline: 'Distinctive visual identities that command attention.',
      bgDay: '#f3ea9a', // Soft Amber Yellow
      textDay: '#713f12',
      borderDay: '#fde047',
      bgNight: 'rgba(234, 179, 8, 0.15)',
      textNight: '#fde047',
      borderNight: 'rgba(234, 179, 8, 0.3)',
      icon: <Star size={20} className="fill-amber-500 text-amber-500" />,
      items: ['Logo & Typography', 'Color Science Tokens', 'Brand Guidelines', 'Social Asset Kits'],
    },
    {
      id: 'framer-next',
      title: 'Framer & Next.js Builds',
      tagline: 'Pixel-perfect production code with zero lag.',
      bgDay: '#c7f8d9', // Mint Green
      textDay: '#064e3b',
      borderDay: '#86efac',
      bgNight: 'rgba(16, 185, 129, 0.15)',
      textNight: '#6ee7b7',
      borderNight: 'rgba(16, 185, 129, 0.3)',
      icon: <Code2 size={20} className="text-emerald-500" />,
      items: ['Next.js 15 & React 19', 'TypeScript Strict Mode', 'Interactive Framer Motion', 'Supabase Realtime'],
    },
    {
      id: '3d-motion',
      title: '3D & Animation',
      tagline: 'Isometric clay assets, vector stickers & motion.',
      bgDay: '#e2dcfd', // Soft Lavender
      textDay: '#3b0764',
      borderDay: '#c4b5fd',
      bgNight: 'rgba(168, 85, 247, 0.15)',
      textNight: '#d8b4fe',
      borderNight: 'rgba(168, 85, 247, 0.3)',
      icon: <Box size={20} className="text-purple-500" />,
      items: ['Blender Claymorphism', 'Custom SVG Stickers', 'Lottie Micro-animations', 'Interactive 3D'],
    },
  ];

  return (
    <section id="creatie-services" className={`relative w-full ${styles.gridPaperSection} py-28 px-6 sm:px-12`}>
      <div className="max-w-4xl mx-auto">
        
        {/* Section Header */}
        <div className={styles.sectionHeader}>
          <div className={`${styles.pillBadge} bg-[#bbf7d0] text-[#15803d] border-2 border-[#86efac]`}>
            <span>✦ 02 - SERVICES</span>
          </div>
          <h2 className={styles.sectionTitle}>
            WHERE I CAN HELP YOU
          </h2>
        </div>

        {/* 5 Stacked Rounded Pastel Pill Bars */}
        <div className="space-y-4 pt-2">
          {services.map((service, idx) => {
            const isExpanded = activeIdx === idx;

            return (
              <div
                key={service.id}
                onClick={() => setActiveIdx(isExpanded ? null : idx)}
                style={{
                  backgroundColor: isDark ? service.bgNight : service.bgDay,
                  color: isDark ? service.textNight : service.textDay,
                  borderColor: isDark ? service.borderNight : service.borderDay,
                }}
                className={`${styles.serviceBar} flex-col transition-all duration-300`}
              >
                {/* Top Row Bar */}
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-white/70 dark:bg-black/30 backdrop-blur-md flex items-center justify-center shadow-sm">
                      {service.icon}
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-black tracking-tight">
                        {service.title}
                      </h3>
                      <p className="text-xs font-semibold opacity-80 hidden sm:block">
                        {service.tagline}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-white/60 dark:bg-black/30 flex items-center justify-center transition-transform duration-300">
                      <ArrowUpRight 
                        size={18} 
                        className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Expanded Deliverables Accordion */}
                {isExpanded && (
                  <div className="w-full pt-5 mt-4 border-t border-current/20 grid grid-cols-2 sm:grid-cols-4 gap-2.5 animate-fade-in">
                    {service.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-xs font-bold">
                        <Check size={12} strokeWidth={3} />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
