-- 003_gallery_schema.sql
-- Schema for Drag-and-Drop Visual Archive Gallery

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

-- Index for ordering
CREATE INDEX IF NOT EXISTS idx_gallery_order ON portfolio_gallery(display_order ASC);

-- Row Level Security (RLS)
ALTER TABLE portfolio_gallery ENABLE ROW LEVEL SECURITY;

-- Public can view gallery items
CREATE POLICY "Public can view gallery items"
    ON portfolio_gallery FOR SELECT
    USING (true);

-- Service role / authenticated admin can manage gallery items
CREATE POLICY "Admin can insert gallery items"
    ON portfolio_gallery FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admin can update gallery items"
    ON portfolio_gallery FOR UPDATE
    USING (true);

CREATE POLICY "Admin can delete gallery items"
    ON portfolio_gallery FOR DELETE
    USING (true);
