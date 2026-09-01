'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import styles from '@/app/second/second.module.css';

export function StatsCards() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const stats = [
    {
      value: '8+',
      title: 'Years of Experience',
      desc: 'Specialized in marketing communication, product UX, and conversion systems.',
      color: '#ef4444', // Red tab
      rotation: '-rotate-2',
    },
    {
      value: '40+',
      title: 'Projects Shipped',
      desc: 'Delivering high-impact designs, Webflow, Framer, and Next.js applications.',
      color: '#84cc16', // Lime Green tab
      rotation: 'rotate-3',
    },
    {
      value: '12+',
      title: 'Industry Honors',
      desc: 'Recognized for creative excellence and high ROAS advertising campaigns.',
      color: '#3b82f6', // Blue tab
      rotation: '-rotate-1',
    },
    {
      value: '100%',
      title: 'Client Satisfaction',
      desc: 'Trusted by tech founders, creators, and growth-oriented businesses worldwide.',
      color: '#eab308', // Yellow tab
      rotation: 'rotate-2',
    },
  ];

  return (
    <section className={`relative w-full ${styles.gridPaperSection} py-20 px-6 sm:px-12`}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((item, idx) => (
            <div
              key={idx}
              className={`${styles.stickyCard} ${item.rotation} transform transition-all duration-300`}
            >
              {/* Colored Corner Tab */}
              <div 
                className={styles.cornerTab}
                style={{ backgroundColor: item.color }}
              />

              {/* Card Content */}
              <div className="flex flex-col justify-between h-full">
                <div>
                  <span className="text-4xl sm:text-5xl font-black block tracking-tight mb-2 text-slate-900 dark:text-white">
                    {item.value}
                  </span>
                  <h4 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-3">
                    {item.title}
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
