-- 001_initial_schema.sql
-- Gading Personal Portfolio CMS Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Projects Table
CREATE TABLE IF NOT EXISTS portfolio_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    subtitle TEXT,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    cover_image_url TEXT NOT NULL,
    cover_image_alt TEXT,
    year TEXT DEFAULT '2026',
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    is_featured BOOLEAN NOT NULL DEFAULT false,
    display_order INTEGER NOT NULL DEFAULT 0,
    client TEXT,
    role TEXT,
    duration TEXT,
    services TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at TIMESTAMPTZ
);

-- Indexes for Projects
CREATE INDEX IF NOT EXISTS idx_projects_slug ON portfolio_projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_status ON portfolio_projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_order ON portfolio_projects(display_order ASC);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON portfolio_projects(is_featured DESC);
CREATE INDEX IF NOT EXISTS idx_projects_category ON portfolio_projects(category);

-- 2. Content Blocks Table
CREATE TABLE IF NOT EXISTS portfolio_content_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES portfolio_projects(id) ON DELETE CASCADE,
    block_type TEXT NOT NULL,
    block_order INTEGER NOT NULL DEFAULT 0,
    content_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for Content Blocks
CREATE INDEX IF NOT EXISTS idx_blocks_project_id ON portfolio_content_blocks(project_id);
CREATE INDEX IF NOT EXISTS idx_blocks_order ON portfolio_content_blocks(project_id, block_order ASC);

-- 3. Tags Table
CREATE TABLE IF NOT EXISTS portfolio_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Project-Tag Relation (Many-to-Many)
CREATE TABLE IF NOT EXISTS portfolio_project_tags (
    project_id UUID NOT NULL REFERENCES portfolio_projects(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES portfolio_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, tag_id)
);

-- 5. Media Table
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

-- 6. Trigger for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_projects_updated_at
    BEFORE UPDATE ON portfolio_projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_blocks_updated_at
    BEFORE UPDATE ON portfolio_content_blocks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Row Level Security (RLS)
ALTER TABLE portfolio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_project_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_media ENABLE ROW LEVEL SECURITY;

-- Public Policies (Read Published only)
CREATE POLICY "Public projects are viewable by everyone" 
    ON portfolio_projects FOR SELECT 
    USING (status = 'published');

CREATE POLICY "Public blocks are viewable for published projects" 
    ON portfolio_content_blocks FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM portfolio_projects 
            WHERE portfolio_projects.id = portfolio_content_blocks.project_id 
            AND portfolio_projects.status = 'published'
        )
    );

CREATE POLICY "Tags are viewable by everyone" 
    ON portfolio_tags FOR SELECT 
    USING (true);

CREATE POLICY "Project tags are viewable by everyone" 
    ON portfolio_project_tags FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM portfolio_projects 
            WHERE portfolio_projects.id = portfolio_project_tags.project_id 
            AND portfolio_projects.status = 'published'
        )
    );

CREATE POLICY "Media is viewable by everyone" 
    ON portfolio_media FOR SELECT 
    USING (true);
