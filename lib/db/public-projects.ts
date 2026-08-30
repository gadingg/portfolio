import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Project } from '@/types/portfolio';

// Fallback seed data in case Supabase credentials are not yet configured
export const FALLBACK_PROJECTS: Project[] = [
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    title: 'PROGRAM MBG Real-Time Leaderboard',
    slug: 'program-mbg-real-time-leaderboard',
    subtitle: 'Gamification & Activity Tracking System',
    description: 'A point, activity, and reward system designed to increase agent participation and make progress visible in real time.',
    category: 'GAMIFICATION SYSTEM',
    cover_image_url: 'https://picsum.photos/id/60/1200/800',
    cover_image_alt: 'PROGRAM MBG Leaderboard Preview',
    year: '2026',
    status: 'published',
    is_featured: true,
    display_order: 1,
    client: 'Internal Company',
    role: 'System Architect & Fullstack Designer',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    blocks: [
      {
        id: 'b1',
        project_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
        block_type: 'heading',
        block_order: 1,
        content_json: { level: 2, text: 'The Challenge' },
      },
      {
        id: 'b2',
        project_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
        block_type: 'paragraph',
        block_order: 2,
        content_json: {
          text: 'Agent activities, daily submissions, and reward points were previously tracked through disjointed spreadsheets and manual messaging, causing low participation visibility and delays in recognizing top performers.',
        },
      },
      {
        id: 'b3',
        project_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
        block_type: 'metrics',
        block_order: 3,
        content_json: {
          items: [
            { value: '+140%', label: 'Active Participation', description: 'Daily agent engagement increase' },
            { value: '< 1s', label: 'Sync Latency', description: 'Real-time leaderboard updates' },
            { value: '450+', label: 'Active Agents', description: 'Engaged in gamified reward cycle' },
          ],
        },
      },
      {
        id: 'b4',
        project_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
        block_type: 'heading',
        block_order: 4,
        content_json: { level: 2, text: 'The System Solution' },
      },
      {
        id: 'b5',
        project_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
        block_type: 'paragraph',
        block_order: 5,
        content_json: {
          text: 'Developed a dedicated web dashboard integrating automated event listening, instant tier progression, and transparent reward redemption. Built with real-time sync and responsive mobile access.',
        },
      },
      {
        id: 'b6',
        project_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
        block_type: 'image',
        block_order: 6,
        content_json: {
          url: 'https://picsum.photos/id/1/1200/700',
          alt: 'Dashboard Architecture',
          caption: 'Real-time Leaderboard Interface with dark mode display',
          width_mode: 'wide',
        },
      },
    ],
  },
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
    title: 'Meta Ads Campaign Workflow',
    slug: 'meta-ads-campaign-workflow',
    subtitle: 'Creative Testing & Lead Generation Engine',
    description: 'A repeatable workflow for creative testing, WhatsApp response tracking, and campaign performance reporting.',
    category: 'PERFORMANCE MARKETING',
    cover_image_url: 'https://picsum.photos/id/96/1200/800',
    cover_image_alt: 'Meta Ads Workflow Preview',
    year: '2026',
    status: 'published',
    is_featured: false,
    display_order: 2,
    client: 'Marketing Division',
    role: 'Performance Marketer & Creative Director',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    blocks: [
      {
        id: 'b21',
        project_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
        block_type: 'heading',
        block_order: 1,
        content_json: { level: 2, text: 'Performance Architecture' },
      },
      {
        id: 'b22',
        project_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
        block_type: 'paragraph',
        block_order: 2,
        content_json: {
          text: 'A structured creative testing matrix combining high-intent copy variations, dynamic video creatives, and UTM tracking directly connected to WhatsApp Business API.',
        },
      },
      {
        id: 'b23',
        project_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
        block_type: 'metrics',
        block_order: 3,
        content_json: {
          items: [
            { value: '+32%', label: 'CTR Improvement', description: 'Compared to baseline creatives' },
            { value: '-18%', label: 'Cost Per Lead', description: 'Lower acquisition expenditure' },
            { value: '1.2k+', label: 'Verified Leads', description: 'Generated in first 60 days' },
          ],
        },
      },
    ],
  },
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3',
    title: 'Property Visual Production System',
    slug: 'property-visual-production-system',
    subtitle: 'AI-Accelerated Asset Engine',
    description: 'A faster production process for property posters, cinematic visuals, and multi-format campaign assets.',
    category: 'AI CREATIVE WORKFLOW',
    cover_image_url: 'https://picsum.photos/id/1043/1200/800',
    cover_image_alt: 'Property Visual Production Preview',
    year: '2026',
    status: 'published',
    is_featured: false,
    display_order: 3,
    client: 'Creative Operations',
    role: 'AI Workflow Engineer',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
  },
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4',
    title: 'Content Activation for Property Agents',
    slug: 'content-activation-for-property-agents',
    subtitle: 'Ecosystem Growth Program',
    description: 'A structured program that connects content targets, internal communication, rewards, and publishing activity.',
    category: 'INTERNAL CAMPAIGN',
    cover_image_url: 'https://picsum.photos/id/119/1200/800',
    cover_image_alt: 'Content Activation Preview',
    year: '2026',
    status: 'published',
    is_featured: false,
    display_order: 4,
    client: 'Internal Growth',
    role: 'Campaign Lead',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
  },
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5',
    title: 'Hot Listing Promotion Ecosystem',
    slug: 'hot-listing-promotion-ecosystem',
    subtitle: 'Multi-Channel Distribution',
    description: 'One listing distributed through office displays, social media, agent broadcasts, AI posters, and Meta Ads.',
    category: 'LISTING DISTRIBUTION',
    cover_image_url: 'https://picsum.photos/id/122/1200/800',
    cover_image_alt: 'Hot Listing Promotion Preview',
    year: '2026',
    status: 'published',
    is_featured: false,
    display_order: 5,
    client: 'Sales Division',
    role: 'Omnichannel Strategist',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
  },
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6',
    title: 'Campaign Recap System',
    slug: 'campaign-recap-system',
    subtitle: 'Automated Analytics & Reporting',
    description: 'A clearer reporting format for budget, clicks, WhatsApp responses, CTR, CPC, CPM, and next actions.',
    category: 'DATA AND REPORTING',
    cover_image_url: 'https://picsum.photos/id/48/1200/800',
    cover_image_alt: 'Campaign Recap Preview',
    year: '2026',
    status: 'published',
    is_featured: false,
    display_order: 6,
    client: 'Marketing Operations',
    role: 'Data & Reporting Specialist',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
  },
];

export async function getPublishedProjects(): Promise<Project[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('portfolio_projects')
      .select('*')
      .eq('status', 'published')
      .order('is_featured', { ascending: false })
      .order('display_order', { ascending: true })
      .order('published_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return FALLBACK_PROJECTS;
    }

    return data as Project[];
  } catch {
    return FALLBACK_PROJECTS;
  }
}

export async function getPublishedProjectBySlug(slug: string): Promise<Project | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: project, error: projectError } = await supabase
      .from('portfolio_projects')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (projectError || !project) {
      const fallback = FALLBACK_PROJECTS.find((p) => p.slug === slug);
      return fallback || null;
    }

    // Fetch content blocks
    const { data: blocks } = await supabase
      .from('portfolio_content_blocks')
      .select('*')
      .eq('project_id', project.id)
      .order('block_order', { ascending: true });

    return {
      ...(project as Project),
      blocks: (blocks || []) as any,
    };
  } catch {
    const fallback = FALLBACK_PROJECTS.find((p) => p.slug === slug);
    return fallback || null;
  }
}

export async function getRelatedProjects(currentSlug: string, category: string, limit: number = 3): Promise<Project[]> {
  const allProjects = await getPublishedProjects();
  const others = allProjects.filter((p) => p.slug !== currentSlug);

  // Priority: same category first, then others
  const sameCategory = others.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  const diffCategory = others.filter((p) => p.category.toLowerCase() !== category.toLowerCase());

  return [...sameCategory, ...diffCategory].slice(0, limit);
}

export async function getNextProject(currentSlug: string): Promise<Project | null> {
  const allProjects = await getPublishedProjects();
  const currentIndex = allProjects.findIndex((p) => p.slug === currentSlug);

  if (currentIndex === -1 || allProjects.length <= 1) {
    return null;
  }

  const nextIndex = (currentIndex + 1) % allProjects.length;
  return allProjects[nextIndex];
}
