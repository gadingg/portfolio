-- =====================================================================
-- SUPABASE COMPLETE AUTOMATED SETUP SCRIPT
-- Gading Personal Portfolio & CMS
-- Safe & Idempotent (Will not duplicate or overwrite existing data)
-- =====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================================
-- 2. CREATE TABLES
-- =====================================================================

-- A. Projects Table
CREATE TABLE IF NOT EXISTS portfolio_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    subtitle TEXT,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    cover_image_url TEXT NOT NULL,
    cover_image_alt TEXT,
    year TEXT DEFAULT '2024–2026',
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published')),
    is_featured BOOLEAN NOT NULL DEFAULT false,
    display_order INTEGER NOT NULL DEFAULT 0,
    client TEXT,
    role TEXT,
    duration TEXT,
    services TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Projects
CREATE INDEX IF NOT EXISTS idx_projects_slug ON portfolio_projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_status ON portfolio_projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_order ON portfolio_projects(display_order ASC);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON portfolio_projects(is_featured DESC);
CREATE INDEX IF NOT EXISTS idx_projects_category ON portfolio_projects(category);

-- B. Content Blocks Table (Dynamic Case Study Blocks)
CREATE TABLE IF NOT EXISTS portfolio_content_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES portfolio_projects(id) ON DELETE CASCADE,
    block_type TEXT NOT NULL,
    block_order INTEGER NOT NULL DEFAULT 0,
    content_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blocks_project_id ON portfolio_content_blocks(project_id);
CREATE INDEX IF NOT EXISTS idx_blocks_order ON portfolio_content_blocks(project_id, block_order ASC);

-- C. Visual Archive Gallery Table (Drag-and-Drop CMS)
CREATE TABLE IF NOT EXISTS portfolio_gallery (
    id TEXT PRIMARY KEY,
    url TEXT NOT NULL,
    alt TEXT DEFAULT '',
    caption TEXT DEFAULT '',
    category TEXT DEFAULT 'Visual Identity',
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gallery_order ON portfolio_gallery(display_order ASC);

-- D. Tags Table
CREATE TABLE IF NOT EXISTS portfolio_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- E. Project Tags Relation
CREATE TABLE IF NOT EXISTS portfolio_project_tags (
    project_id UUID NOT NULL REFERENCES portfolio_projects(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES portfolio_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, tag_id)
);

-- F. Media Log Table
CREATE TABLE IF NOT EXISTS portfolio_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES portfolio_projects(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('image', 'video')),
    url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    filename TEXT,
    alt_text TEXT,
    caption TEXT,
    width INTEGER,
    height INTEGER,
    duration NUMERIC,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================================
-- 3. TIMESTAMP TRIGGERS
-- =====================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_projects_updated_at ON portfolio_projects;
CREATE TRIGGER trigger_projects_updated_at
    BEFORE UPDATE ON portfolio_projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_blocks_updated_at ON portfolio_content_blocks;
CREATE TRIGGER trigger_blocks_updated_at
    BEFORE UPDATE ON portfolio_content_blocks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_gallery_updated_at ON portfolio_gallery;
CREATE TRIGGER trigger_gallery_updated_at
    BEFORE UPDATE ON portfolio_gallery
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================
ALTER TABLE portfolio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_project_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_media ENABLE ROW LEVEL SECURITY;

-- Clean existing policies to avoid duplicates
DO $$
BEGIN
    -- Projects
    DROP POLICY IF EXISTS "Public can view published projects" ON portfolio_projects;
    DROP POLICY IF EXISTS "Admin can manage projects" ON portfolio_projects;
    -- Blocks
    DROP POLICY IF EXISTS "Public can view published blocks" ON portfolio_content_blocks;
    DROP POLICY IF EXISTS "Admin can manage blocks" ON portfolio_content_blocks;
    -- Gallery
    DROP POLICY IF EXISTS "Public can view gallery items" ON portfolio_gallery;
    DROP POLICY IF EXISTS "Admin can manage gallery items" ON portfolio_gallery;
    -- Tags
    DROP POLICY IF EXISTS "Public can view tags" ON portfolio_tags;
    DROP POLICY IF EXISTS "Admin can manage tags" ON portfolio_tags;
    -- Media
    DROP POLICY IF EXISTS "Public can view media" ON portfolio_media;
    DROP POLICY IF EXISTS "Admin can manage media" ON portfolio_media;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- Public Read Policies
CREATE POLICY "Public can view published projects" 
    ON portfolio_projects FOR SELECT 
    USING (status = 'published');

CREATE POLICY "Admin can manage projects" 
    ON portfolio_projects FOR ALL 
    USING (true) WITH CHECK (true);

CREATE POLICY "Public can view published blocks" 
    ON portfolio_content_blocks FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM portfolio_projects 
            WHERE portfolio_projects.id = portfolio_content_blocks.project_id 
            AND portfolio_projects.status = 'published'
        )
    );

CREATE POLICY "Admin can manage blocks" 
    ON portfolio_content_blocks FOR ALL 
    USING (true) WITH CHECK (true);

CREATE POLICY "Public can view gallery items" 
    ON portfolio_gallery FOR SELECT 
    USING (true);

CREATE POLICY "Admin can manage gallery items" 
    ON portfolio_gallery FOR ALL 
    USING (true) WITH CHECK (true);

CREATE POLICY "Public can view tags" 
    ON portfolio_tags FOR SELECT 
    USING (true);

CREATE POLICY "Admin can manage tags" 
    ON portfolio_tags FOR ALL 
    USING (true) WITH CHECK (true);

CREATE POLICY "Public can view media" 
    ON portfolio_media FOR SELECT 
    USING (true);

CREATE POLICY "Admin can manage media" 
    ON portfolio_media FOR ALL 
    USING (true) WITH CHECK (true);

-- =====================================================================
-- 5. STORAGE BUCKET & STORAGE POLICIES
-- =====================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('portfolio-public', 'portfolio-public', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
    DROP POLICY IF EXISTS "Admin Upload Access" ON storage.objects;
    DROP POLICY IF EXISTS "Admin Update Access" ON storage.objects;
    DROP POLICY IF EXISTS "Admin Delete Access" ON storage.objects;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

CREATE POLICY "Public Read Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'portfolio-public');

CREATE POLICY "Admin Upload Access" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'portfolio-public');

CREATE POLICY "Admin Update Access" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'portfolio-public');

CREATE POLICY "Admin Delete Access" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'portfolio-public');

-- =====================================================================
-- 6. INITIAL SEED DATA (Career Wall of Fame & Verified Case Studies)
-- =====================================================================

-- Seed Project 1: Internal Listing Hub
INSERT INTO portfolio_projects (
    id, title, slug, subtitle, description, category, cover_image_url, cover_image_alt, year, status, is_featured, display_order, client, role, duration, services, published_at
) VALUES (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    'Internal Listing Hub',
    'internal-listing-hub',
    'Property Marketplace & Agent Search Tool',
    'A centralized property listing hub that replaced scattered WhatsApp groups, enabling 50+ agents to search, filter, and share verified listings with clients in seconds.',
    'MARKETPLACE TOOL',
    'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/5bab247f-35d9-400d-a82b-fd87cfe913d2_1600w.webp',
    'Internal Listing Hub Interface Preview',
    '2024–2026',
    'published',
    true,
    1,
    'PropTech Brokerage Network',
    'Lead Architect & Fullstack Designer',
    '3 Weeks',
    ARRAY['Web-App Development', 'UI/UX Design', 'Database Architecture', 'Internal Workflow'],
    NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Seed Project 2: Meta Ads Campaign System
INSERT INTO portfolio_projects (
    id, title, slug, subtitle, description, category, cover_image_url, cover_image_alt, year, status, is_featured, display_order, client, role, duration, services, published_at
) VALUES (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
    'Meta Ads Campaign System',
    'meta-ads-campaign-system',
    'Performance Marketing & Lead Generation Engine',
    'A systematic paid advertising pipeline connecting targeted visual creatives, direct-to-WhatsApp messaging triggers, and live KPI reporting dashboards.',
    'PERFORMANCE ADS',
    'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/26f04b2b-4ba5-4f3b-baef-c3dfdc2d08a5_1600w.webp',
    'Meta Ads Campaign Dashboard Preview',
    '2024–2026',
    'published',
    true,
    2,
    'Digital Brokerage & Commercial Developments',
    'Performance Marketer & Creative Director',
    'Continuous Optimization',
    ARRAY['Meta Ads (FB/IG)', 'Creative Strategy', 'Conversion Tracking', 'WhatsApp CRM Routing'],
    NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Seed Project 3: PROGRAM MBG Leaderboard
INSERT INTO portfolio_projects (
    id, title, slug, subtitle, description, category, cover_image_url, cover_image_alt, year, status, is_featured, display_order, client, role, duration, services, published_at
) VALUES (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3',
    'PROGRAM MBG Leaderboard',
    'program-mbg-real-time-leaderboard',
    'Real-Time Gamification & Activity Tracking System',
    'A competitive real-time gamification leaderboard built to motivate property agents, track daily listing activities, and automate monthly commission milestones.',
    'GAMIFICATION SYSTEM',
    'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/4734259a-bad7-422f-981e-ce01e79184f2_1600w.jpg',
    'PROGRAM MBG Leaderboard Preview',
    '2024–2026',
    'published',
    true,
    3,
    'Internal Corporate Network',
    'Product Designer & Frontend Developer',
    '2 Weeks',
    ARRAY['Gamification Design', 'Realtime Web App', 'Agent Leaderboard', 'Automation Scripting'],
    NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Seed Initial Visual Archive Gallery Items
INSERT INTO portfolio_gallery (id, url, alt, caption, category, display_order) VALUES
('gallery-01', 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/4734259a-bad7-422f-981e-ce01e79184f2_1600w.jpg', 'Visual Archive Fragment 01', 'Minimalist monochrome aesthetic study', 'Visual Identity', 1),
('gallery-02', 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/c543a9e1-f226-4ced-80b0-feb8445a75b9_1600w.jpg', 'Visual Archive Fragment 02', 'Editorial design composition', 'Editorial', 2),
('gallery-03', 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/917d6f93-fb36-439a-8c48-884b67b35381_1600w.jpg', 'Visual Archive Fragment 03', 'High-contrast typographic structure', 'Typography', 3),
('gallery-04', 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/4734259a-bad7-422f-981e-ce01e79184f2_1600w.jpg', 'Visual Archive Fragment 04', 'Conceptual motion framing', 'Motion Experiment', 4),
('gallery-05', 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/c543a9e1-f226-4ced-80b0-feb8445a75b9_1600w.jpg', 'Visual Archive Fragment 05', 'Digital layout fragment', 'Interface Art', 5)
ON CONFLICT (id) DO NOTHING;
