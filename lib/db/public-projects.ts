import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Project } from '@/types/portfolio';

// Fallback seed data matching verified copywriting.md case studies
export const FALLBACK_PROJECTS: Project[] = [
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    title: 'Internal Listing Hub',
    slug: 'internal-listing-hub',
    subtitle: 'Property Marketplace & Agent Search Tool',
    description: 'A centralized property listing hub that replaced scattered WhatsApp groups, enabling 50+ agents to search, filter, and share verified listings with clients in seconds.',
    category: 'MARKETPLACE TOOL',
    cover_image_url: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/5bab247f-35d9-400d-a82b-fd87cfe913d2_1600w.webp',
    cover_image_alt: 'Internal Listing Hub Interface Preview',
    year: '2024–2026',
    status: 'published',
    is_featured: true,
    display_order: 1,
    client: 'Xavier Marks Tjandra Patos',
    role: 'Lead Architect & Fullstack Designer',
    duration: '3 Weeks',
    services: ['Web-App Development', 'UI/UX Design', 'Database Architecture', 'Internal Workflow'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    blocks: [
      {
        id: 'b1',
        project_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
        block_type: 'heading',
        block_order: 1,
        content_json: { level: 2, text: 'The Operational Bottleneck' },
      },
      {
        id: 'b2',
        project_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
        block_type: 'paragraph',
        block_order: 2,
        content_json: {
          text: 'Over 50 property agents were relying on crowded WhatsApp groups and local smartphone storage to share primary and secondary property listings. Finding specific unit specifications, updated price lists, or marketing flyers during client meetings often took 10 to 15 minutes of scrolling, leading to missed sales momentum.',
        },
      },
      {
        id: 'b3',
        project_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
        block_type: 'metrics',
        block_order: 3,
        content_json: {
          items: [
            { value: '< 5s', label: 'Listing Search', description: 'Reduced from 15 min manual chat search' },
            { value: '50+', label: 'Active Agents', description: 'Daily operational users across the office' },
            { value: '100%', label: 'Verified Inventory', description: 'Eliminated outdated duplicate listings' },
          ],
        },
      },
      {
        id: 'b4',
        project_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
        block_type: 'heading',
        block_order: 4,
        content_json: { level: 2, text: 'The Web-App Solution' },
      },
      {
        id: 'b5',
        project_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
        block_type: 'paragraph',
        block_order: 5,
        content_json: {
          text: 'Instead of waiting for an external software vendor, Gading designed and developed a dedicated internal web application. Built with instant faceted search (location, price bracket, bedroom count, developer), one-click flyer PDF downloads, and branded client WhatsApp share buttons with pre-filled property highlights.',
        },
      },
      {
        id: 'b6',
        project_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
        block_type: 'image',
        block_order: 6,
        content_json: {
          url: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/5bab247f-35d9-400d-a82b-fd87cfe913d2_1600w.webp',
          alt: 'Internal Listing Hub Search Interface',
          caption: 'Instant search and filter interface optimized for both mobile and desktop use',
          width_mode: 'wide',
        },
      },
    ],
  },
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
    title: 'Meta Ads Campaign System',
    slug: 'meta-ads-campaign-workflow',
    subtitle: 'Performance Marketing & Lead Generation Engine',
    description: 'A structured workflow connecting ad creative iteration, audience testing, and WhatsApp response attribution, driving over Rp118M in gross commission.',
    category: 'PERFORMANCE MARKETING',
    cover_image_url: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/30104e3c-5eea-4b93-93e9-5313698a7156_1600w.webp',
    cover_image_alt: 'Meta Ads Campaign Workflow Preview',
    year: '2023–2026',
    status: 'published',
    is_featured: true,
    display_order: 2,
    client: 'Xavier Marks Tjandra Patos',
    role: 'Performance Marketer & Creative Director',
    duration: 'Ongoing System',
    services: ['Meta Ads Management', 'Creative Production', 'Funnel Tracking', 'WhatsApp CRM Integration'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    blocks: [
      {
        id: 'b21',
        project_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
        block_type: 'heading',
        block_order: 1,
        content_json: { level: 2, text: 'The Performance Challenge' },
      },
      {
        id: 'b22',
        project_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
        block_type: 'paragraph',
        block_order: 2,
        content_json: {
          text: 'Property advertising on Meta often suffers from rising cost-per-lead and low lead quality when running standard generic single-image banners. Without structured creative testing and rapid message follow-up, marketing budgets were failing to convert into closed property transactions.',
        },
      },
      {
        id: 'b23',
        project_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
        block_type: 'metrics',
        block_order: 3,
        content_json: {
          items: [
            { value: 'Rp118M', label: 'Gross Commission', description: 'Generated through verified ad campaigns' },
            { value: '-24%', label: 'Cost Per Inquiry', description: 'Lower acquisition cost via hook testing' },
            { value: '1,200+', label: 'Qualified Inquiries', description: 'Directly routed to sales agents' },
          ],
        },
      },
      {
        id: 'b24',
        project_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
        block_type: 'heading',
        block_order: 4,
        content_json: { level: 2, text: 'The Testing Matrix & Reporting System' },
      },
      {
        id: 'b25',
        project_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
        block_type: 'paragraph',
        block_order: 5,
        content_json: {
          text: 'Gading built a systematic creative testing matrix pairing short-form video hooks with benefit-led carousel graphics. Leads were routed via customized WhatsApp CTA links with distinct UTM identifiers, allowing real-time visibility into which ad creatives delivered actual showroom visits and closed bookings.',
        },
      },
    ],
  },
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3',
    title: 'PROGRAM MBG Leaderboard',
    slug: 'program-mbg-real-time-leaderboard',
    subtitle: 'Real-Time Gamification & Activity Tracking System',
    description: 'An internal gamification web application that visualizes agent daily activities, listing milestones, and reward point progression in real time.',
    category: 'GAMIFICATION SYSTEM',
    cover_image_url: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/4734259a-bad7-422f-981e-ce01e79184f2_1600w.jpg',
    cover_image_alt: 'PROGRAM MBG Leaderboard Preview',
    year: '2024',
    status: 'published',
    is_featured: false,
    display_order: 3,
    client: 'Office Internal Program',
    role: 'System Architect & Frontend Developer',
    duration: '2 Weeks',
    services: ['Gamification Design', 'Fullstack Development', 'Data Visualization', 'Staff Training'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    blocks: [
      {
        id: 'b31',
        project_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3',
        block_type: 'heading',
        block_order: 1,
        content_json: { level: 2, text: 'The Problem with Disjointed Spreadsheets' },
      },
      {
        id: 'b32',
        project_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3',
        block_type: 'paragraph',
        block_order: 2,
        content_json: {
          text: 'Internal sales challenges and reward programs often lose steam when points are tallied manually once a week. Agents had no immediate feedback on how close they were to the next reward tier, reducing participation excitement and friendly office competition.',
        },
      },
      {
        id: 'b33',
        project_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3',
        block_type: 'metrics',
        block_order: 3,
        content_json: {
          items: [
            { value: '+140%', label: 'Activity Submissions', description: 'Increase in daily recorded agent actions' },
            { value: '< 1s', label: 'Sync Latency', description: 'Instant point updates on office display' },
            { value: '100%', label: 'Digital Transparency', description: 'Zero disputes over score calculations' },
          ],
        },
      },
      {
        id: 'b34',
        project_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3',
        block_type: 'heading',
        block_order: 4,
        content_json: { level: 2, text: 'Live Leaderboard & Point Engine' },
      },
      {
        id: 'b35',
        project_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3',
        block_type: 'paragraph',
        block_order: 5,
        content_json: {
          text: 'Built a responsive leaderboard web application displayed on office TV screens and accessible via agents mobile phones. Features real-time ranking shifts, activity submission badges, and an automated points ledger that eliminated manual administrative calculations.',
        },
      },
    ],
  },
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4',
    title: 'Kosan Bu Endang',
    slug: 'kosan-bu-endang-rent-app',
    subtitle: 'Property Turnaround & Rent Management Web-App',
    description: 'Repositioned and renovated a student rental property to achieve 100% occupancy in 2 weeks, paired with a custom web application for rent tracking and accounting.',
    category: 'OPERATIONS & DIGITAL TOOLS',
    cover_image_url: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/c543a9e1-f226-4ced-80b0-feb8445a75b9_1600w.jpg',
    cover_image_alt: 'Kosan Bu Endang Property and App Preview',
    year: '2023–Present',
    status: 'published',
    is_featured: false,
    display_order: 4,
    client: 'Family Business Property',
    role: 'Owner, Marketer & Developer',
    duration: 'Renovation + Continuous Operations',
    services: ['Property Renovation', 'Visual Marketing', 'Web-App Development', 'Automated Accounting'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    blocks: [
      {
        id: 'b41',
        project_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4',
        block_type: 'heading',
        block_order: 1,
        content_json: { level: 2, text: 'The Turnaround Challenge' },
      },
      {
        id: 'b42',
        project_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4',
        block_type: 'paragraph',
        block_order: 2,
        content_json: {
          text: 'The rental property suffered from high vacancy rates, outdated room aesthetics, and manual pen-and-paper billing that caused frequent payment delays and confusion during monthly reconciliations.',
        },
      },
      {
        id: 'b43',
        project_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4',
        block_type: 'metrics',
        block_order: 3,
        content_json: {
          items: [
            { value: '100%', label: 'Occupancy Rate', description: 'Achieved in just 2 weeks after relaunch' },
            { value: '0', label: 'Billing Delays', description: 'Automated rent reminders via WhatsApp' },
            { value: '100%', label: 'Digital Records', description: 'Real-time expense and revenue dashboard' },
          ],
        },
      },
      {
        id: 'b44',
        project_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4',
        block_type: 'heading',
        block_order: 4,
        content_json: { level: 2, text: 'Strategic Marketing & Custom Tool' },
      },
      {
        id: 'b45',
        project_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4',
        block_type: 'paragraph',
        block_order: 5,
        content_json: {
          text: 'Guided an aesthetic renovation, created targeted social media photo/video tours, and achieved full room occupancy in 14 days. To maintain frictionless operations, Gading developed a dedicated web app for tenant billing, payment confirmation, and automated reminder alerts.',
        },
      },
    ],
  },
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5',
    title: 'Geektuku & Digital Brands',
    slug: 'geektuku-digital-brands',
    subtitle: 'Brand Building & E-Commerce Operations',
    description: 'Built digital product brands across Shopee and Tokopedia, achieving 500+ verified 5-star reviews through customer-centric design and automated fulfillment workflows.',
    category: 'BRAND & DIGITAL COMMERCE',
    cover_image_url: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/917d6f93-fb36-439a-8c48-884b67b35381_1600w.jpg',
    cover_image_alt: 'Geektuku Brand Assets Preview',
    year: '2021–2023',
    status: 'published',
    is_featured: false,
    display_order: 5,
    client: 'Independent Venture',
    role: 'Founder, Brand Designer & Operator',
    duration: '2 Years',
    services: ['E-Commerce Strategy', 'Packaging & Visual Brand', 'Customer Experience', 'Marketplace SEO'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    blocks: [
      {
        id: 'b51',
        project_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5',
        block_type: 'heading',
        block_order: 1,
        content_json: { level: 2, text: 'Building Consumer Trust in Digital Retail' },
      },
      {
        id: 'b52',
        project_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5',
        block_type: 'paragraph',
        block_order: 2,
        content_json: {
          text: 'In hyper-competitive marketplace environments like Shopee and Tokopedia, product differentiation cannot rely on price discounts alone. Gading managed end-to-end branding, photography, customer communication scripts, and packaging touchpoints to establish high brand loyalty.',
        },
      },
      {
        id: 'b53',
        project_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5',
        block_type: 'metrics',
        block_order: 3,
        content_json: {
          items: [
            { value: '500+', label: 'Positive Reviews', description: 'Verified 5-star customer ratings' },
            { value: '4.9 / 5', label: 'Store Rating', description: 'Maintained across multiple retail brands' },
            { value: '98%', label: 'Fulfillment Speed', description: 'Same-day order dispatch rate' },
          ],
        },
      },
    ],
  },
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6',
    title: 'Peduly.com Campaign Content',
    slug: 'peduly-campaign-content',
    subtitle: 'Viral Campaign Content & Community UI/UX',
    description: 'Designed social media campaigns and mobile content that garnered 400K+ views and 30K+ likes, proving the power of empathy-driven creative production.',
    category: 'CAMPAIGN CONTENT & PRODUCTION',
    cover_image_url: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/3b2725ca-5b05-49fe-b2ff-9de382bf26ef_1600w.webp',
    cover_image_alt: 'Peduly.com Social Campaign Preview',
    year: '2022–2023',
    status: 'published',
    is_featured: false,
    display_order: 6,
    client: 'Peduly.com',
    role: 'Creative Content Designer & UI/UX Contributor',
    duration: '1 Year',
    services: ['Short-Form Video', 'Campaign Graphic Design', 'Social Media Strategy', 'UI/UX Mockups'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    blocks: [
      {
        id: 'b61',
        project_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6',
        block_type: 'heading',
        block_order: 1,
        content_json: { level: 2, text: 'Engaging Audiences for Social Impact' },
      },
      {
        id: 'b62',
        project_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6',
        block_type: 'paragraph',
        block_order: 2,
        content_json: {
          text: 'Social impact and crowdfunding campaigns require sharp visual storytelling to break through social media feeds. Gading produced creative video content and informative carousel infographics that clearly communicated each beneficiary story.',
        },
      },
      {
        id: 'b63',
        project_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6',
        block_type: 'metrics',
        block_order: 3,
        content_json: {
          items: [
            { value: '400K+', label: 'Total Views', description: 'Across organic social campaigns' },
            { value: '30K+', label: 'Audience Likes', description: 'Direct community engagement' },
            { value: '150K+', label: 'Reels Reach', description: 'High-performing short-form video' },
          ],
        },
      },
    ],
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
