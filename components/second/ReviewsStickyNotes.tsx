'use client';

import React from 'react';
import { Star, Quote, CheckCircle2 } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import styles from '@/app/second/second.module.css';

export function ReviewsStickyNotes() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const reviews = [
    {
      name: 'Sarah Mitchell',
      role: 'Founder @ Lumina Labs',
      initials: 'SM',
      avatarColor: 'from-amber-400 to-orange-500',
      quote: 'The fluid micro-interactions and tactile layout completely transformed our product launch. Users constantly compliment the feel!',
      rotation: '-rotate-2',
      stars: 5,
    },
    {
      name: 'Alexandre Kim',
      role: 'Head of Growth @ WaxyWeb',
      initials: 'AK',
      avatarColor: 'from-sky-400 to-indigo-500',
      quote: 'Obsessive attention to detail. The dynamic Day/Night transitions and interactive stickers made our site unforgettable.',
      rotation: 'rotate-3',
      stars: 5,
    },
    {
      name: 'Elena Rostova',
      role: 'Design Director @ Studio Pulse',
      initials: 'ER',
      avatarColor: 'from-purple-400 to-pink-500',
      quote: 'Delivered our Framer & Next.js build ahead of schedule with 100/100 Lighthouse score. True craft engineering.',
      rotation: '-rotate-1',
      stars: 5,
    },
    {
      name: 'David Lindqvist',
      role: 'VP Marketing @ Nordic SaaS',
      initials: 'DL',
      avatarColor: 'from-emerald-400 to-teal-500',
      quote: 'Our Meta Ads campaign ROAS jumped from 2.1x to 4.8x within 30 days after implementing the creative ad system.',
      rotation: 'rotate-2',
      stars: 5,
    },
    {
      name: 'Maya Tanaka',
      role: 'Creative Lead @ Tokyo Wave',
      initials: 'MT',
      avatarColor: 'from-rose-400 to-red-500',
      quote: 'A rare unicorn who pairs high aesthetic taste with deep technical engineering and marketing psychology.',
      rotation: '-rotate-3',
      stars: 5,
    },
    {
      name: 'Lucas Vance',
      role: 'CEO @ Patos Platform',
      initials: 'LV',
      avatarColor: 'from-blue-500 to-cyan-400',
      quote: 'Working with Gading was one of our best product decisions. The entire listing platform is blazing fast and beautiful.',
      rotation: 'rotate-1',
      stars: 5,
    },
  ];

  return (
    <section id="creatie-about" className={`relative w-full ${styles.gridPaperSection} py-28 px-6 sm:px-12`}>
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className={styles.sectionHeader}>
          <div className={`${styles.pillBadge} bg-[#fed7aa] text-[#c2410c] border-2 border-[#fdba74]`}>
            <span>✦ 03 - REVIEWS</span>
          </div>
          <h2 className={styles.sectionTitle}>
            CLIENTS LIKED THE PIXELS
          </h2>
        </div>

        {/* 6 Tilted Sticky Note Cards with Folded Dog-Ear Corner */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
          {reviews.map((review, idx) => (
            <div
              key={idx}
              className={`${styles.stickyCard} ${review.rotation} transform transition-all duration-300 overflow-hidden`}
            >
              {/* Folded Dog-Ear Corner in Bottom Right */}
              <div className={styles.dogEarFold} />

              {/* Client Profile Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-tr ${review.avatarColor} p-[2px] shadow-sm`}>
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center font-black text-xs text-white">
                    {review.initials}
                  </div>
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
                    {review.name}
                  </h4>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    {review.role}
                  </span>
                </div>
              </div>

              {/* Star Rating */}
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: review.stars }).map((_, i) => (
                  <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed pr-4">
                &ldquo;{review.quote}&rdquo;
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
