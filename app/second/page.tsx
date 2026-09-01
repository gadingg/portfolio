'use client';

import React, { useState } from 'react';
import { SkyBackground } from '@/components/second/SkyBackground';
import { CreatieHero } from '@/components/second/CreatieHero';
import { StatsCards } from '@/components/second/StatsCards';
import { ProjectsShowcase } from '@/components/second/ProjectsShowcase';
import { ServicesPills } from '@/components/second/ServicesPills';
import { ReviewsStickyNotes } from '@/components/second/ReviewsStickyNotes';
import { FooterCTA } from '@/components/second/FooterCTA';
import { FloatingDock } from '@/components/second/FloatingDock';
import { MacContactModal } from '@/components/second/MacContactModal';
import styles from '@/app/second/second.module.css';

export default function SecondPage() {
  const [isContactOpen, setIsContactOpen] = useState(false);

  return (
    <main className={styles.pageContainer}>
      
      {/* 1. Dynamic Day & Night Panoramic Background */}
      <SkyBackground />

      {/* 2. Page Content Flow matching Creatie Reference */}
      <div className="relative z-10">
        {/* Hero Display */}
        <CreatieHero onOpenContact={() => setIsContactOpen(true)} />

        {/* Stats Paper Sticky Cards */}
        <StatsCards />

        {/* Selected Works with Paperclips */}
        <ProjectsShowcase />

        {/* Services 5 Pastel Bars */}
        <ServicesPills />

        {/* Client Reviews Sticky Notes with Dog-Ear Folds */}
        <ReviewsStickyNotes />

        {/* Panoramic Footer & Running Marquee */}
        <FooterCTA onOpenContact={() => setIsContactOpen(true)} />
      </div>

      {/* 3. Floating macOS Dock & Day/Night Switcher */}
      <FloatingDock onOpenContact={() => setIsContactOpen(true)} />

      {/* 4. macOS Safari Window Contact Modal */}
      <MacContactModal 
        isOpen={isContactOpen} 
        onClose={() => setIsContactOpen(false)} 
      />

    </main>
  );
}
