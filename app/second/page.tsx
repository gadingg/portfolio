import React from 'react';
import { Header } from '@/components/public/Header';
import { Hero } from '@/components/public/Hero';
import { About } from '@/components/public/About';
import { RecentWorks } from '@/components/public/RecentWorks';
import { Gallery } from '@/components/public/Gallery';
import { Apps } from '@/components/public/Apps';
import { Footer } from '@/components/public/Footer';
import { getPublishedProjects } from '@/lib/db/public-projects';

export const revalidate = 60; // Revalidate every 60 seconds (ISR)

export default async function HomePage() {
  const projects = await getPublishedProjects();

  return (
    <>
      <Header />
      <div className="ambient-layer" aria-hidden="true">
        <div className="ambient-orb ambient-orb--amber" />
        <div className="ambient-orb ambient-orb--teal" />
      </div>
      <Hero />
      <About />
      <RecentWorks projects={projects} />
      <Gallery />
      <Apps />
      <Footer />
    </>
  );
}
