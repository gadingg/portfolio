import React from 'react';
import { Project, CardVariant } from '@/types/portfolio';
import { DefaultCard } from './DefaultCard';
import { FeaturedCard } from './FeaturedCard';
import { MotionPortfolioCard } from './MotionPortfolioCard';

interface PortfolioCardRendererProps {
  project: Project;
  variant?: CardVariant;
}

export function PortfolioCardRenderer({ project, variant }: PortfolioCardRendererProps) {
  // Determine variant automatically if not specified
  const activeVariant: CardVariant = variant || (project.is_featured ? 'featured' : 'default');

  switch (activeVariant) {
    case 'featured':
    case 'wide':
      return <FeaturedCard project={project} />;
    case 'motion':
      return <MotionPortfolioCard project={project} videoUrl="https://vjs.zencdn.net/v/oceans.mp4" />;
    case 'default':
    default:
      return <DefaultCard project={project} />;
  }
}
