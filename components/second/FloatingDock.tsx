'use client';

import React from 'react';
import { 
  FileText, 
  FolderGit2, 
  Layers, 
  Mail, 
  Sun, 
  Moon 
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import styles from '@/app/second/second.module.css';

interface FloatingDockProps {
  onOpenContact: () => void;
}

export function FloatingDock({ onOpenContact }: FloatingDockProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const dockItems = [
    {
      id: 'about',
      label: 'About & Stats',
      icon: (
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-200 flex items-center justify-center text-amber-950 shadow-md">
          <FileText size={20} strokeWidth={2.2} />
        </div>
      ),
      action: () => scrollToSection('creatie-about'),
    },
    {
      id: 'projects',
      label: 'Selected Works',
      icon: (
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-400 to-indigo-300 flex items-center justify-center text-indigo-950 shadow-md">
          <FolderGit2 size={20} strokeWidth={2.2} />
        </div>
      ),
      action: () => scrollToSection('creatie-projects'),
    },
    {
      id: 'services',
      label: 'Services',
      icon: (
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-200 flex items-center justify-center text-emerald-950 shadow-md">
          <Layers size={20} strokeWidth={2.2} />
        </div>
      ),
      action: () => scrollToSection('creatie-services'),
    },
    {
      id: 'contact',
      label: 'Contact',
      icon: (
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-400 to-pink-200 flex items-center justify-center text-rose-950 shadow-md">
          <Mail size={20} strokeWidth={2.2} />
        </div>
      ),
      action: onOpenContact,
    },
  ];

  return (
    <div className={styles.dockContainer}>
      {/* 4 macOS App Icons */}
      {dockItems.map((item) => (
        <button
          key={item.id}
          onClick={item.action}
          className={styles.dockItem}
          aria-label={item.label}
        >
          {item.icon}
          <span className={styles.dockTooltip}>{item.label}</span>
        </button>
      ))}

      {/* Vertical Divider */}
      <div className={`w-[1px] h-7 mx-1 ${isDark ? 'bg-slate-700/70' : 'bg-slate-300'}`} />

      {/* Day / Night Switcher */}
      <button
        onClick={toggleTheme}
        className={styles.dockItem}
        aria-label="Toggle Theme"
      >
        <div
          className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-md transition-all ${
            isDark
              ? 'bg-gradient-to-tr from-indigo-900 to-purple-800 text-yellow-300 border border-indigo-500/30'
              : 'bg-gradient-to-tr from-amber-300 to-yellow-100 text-amber-900 border border-amber-300/60'
          }`}
        >
          {isDark ? <Moon size={20} /> : <Sun size={20} />}
        </div>
        <span className={styles.dockTooltip}>
          {isDark ? 'Day Mode ☀️' : 'Night Mode 🌙'}
        </span>
      </button>
    </div>
  );
}
