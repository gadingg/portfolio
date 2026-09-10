-- seed.sql
-- Initial Seed Data for Gading Personal Portfolio CMS

-- Insert Initial Tags
INSERT INTO portfolio_tags (id, name, slug) VALUES
('11111111-1111-1111-1111-111111111101', 'Gamification System', 'gamification-system'),
('11111111-1111-1111-1111-111111111102', 'Web App', 'web-app'),
('11111111-1111-1111-1111-111111111103', 'Performance Marketing', 'performance-marketing'),
('11111111-1111-1111-1111-111111111104', 'Meta Ads', 'meta-ads'),
('11111111-1111-1111-1111-111111111105', 'AI Creative Workflow', 'ai-creative-workflow'),
('11111111-1111-1111-1111-111111111106', 'Graphic Design', 'graphic-design'),
('11111111-1111-1111-1111-111111111107', 'Internal Campaign', 'internal-campaign'),
('11111111-1111-1111-1111-111111111108', 'Listing Distribution', 'listing-distribution'),
('11111111-1111-1111-1111-111111111109', 'Data and Reporting', 'data-and-reporting')
ON CONFLICT (name) DO NOTHING;

-- Project 1: PROGRAM MBG Real-Time Leaderboard
INSERT INTO portfolio_projects (
    id, title, slug, subtitle, description, category, cover_image_url, cover_image_alt, year, status, is_featured, display_order, client, role, published_at
) VALUES (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    'PROGRAM MBG Real-Time Leaderboard',
    'program-mbg-real-time-leaderboard',
    'Gamification & Activity Tracking System',
    'A point, activity, and reward system designed to increase agent participation and make progress visible in real time.',
    'Gamification System',
    'https://picsum.photos/id/60/1200/800',
    'PROGRAM MBG Leaderboard Preview',
    '2026',
    'published',
    true,
    1,
    'Internal Company',
    'System Architect & Fullstack Designer',
    NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Blocks for Project 1
INSERT INTO portfolio_content_blocks (project_id, block_type, block_order, content_json) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'heading', 1, '{"level": 2, "text": "The Challenge"}'::jsonb),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'paragraph', 2, '{"text": "Agent activities, daily submissions, and reward points were previously tracked through disjointed spreadsheets and manual messaging, causing low participation visibility and delays in recognizing top performers."}'::jsonb),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'metrics', 3, '{"items": [{"value": "+140%", "label": "Active Participation", "description": "Daily agent engagement increase"}, {"value": "< 1s", "label": "Sync Latency", "description": "Real-time leaderboard updates"}, {"value": "450+", "label": "Active Agents", "description": "Engaged in gamified reward cycle"}]}'::jsonb),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'heading', 4, '{"level": 2, "text": "The System Solution"}'::jsonb),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'paragraph', 5, '{"text": "Developed a dedicated web dashboard integrating automated event listening, instant tier progression, and transparent reward redemption."}'::jsonb),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'image', 6, '{"url": "https://picsum.photos/id/1/1200/700", "alt": "Dashboard Architecture", "caption": "Real-time Leaderboard Interface with dark mode display", "width_mode": "wide"}'::jsonb);

-- Project 2: Meta Ads Campaign Workflow
INSERT INTO portfolio_projects (
    id, title, slug, subtitle, description, category, cover_image_url, cover_image_alt, year, status, is_featured, display_order, client, role, published_at
) VALUES (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
    'Meta Ads Campaign Workflow',
    'meta-ads-campaign-workflow',
    'Creative Testing & Lead Generation Engine',
    'A repeatable workflow for creative testing, WhatsApp response tracking, and campaign performance reporting.',
    'Performance Marketing',
    'https://picsum.photos/id/96/1200/800',
    'Meta Ads Workflow Preview',
    '2026',
    'published',
    false,
    2,
    'Marketing Division',
    'Performance Marketer & Creative Director',
    NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Blocks for Project 2
INSERT INTO portfolio_content_blocks (project_id, block_type, block_order, content_json) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'heading', 1, '{"level": 2, "text": "Performance Architecture"}'::jsonb),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'paragraph', 2, '{"text": "A structured creative testing matrix combining high-intent copy variations, dynamic video creatives, and UTM tracking directly connected to WhatsApp Business API."}'::jsonb),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'metrics', 3, '{"items": [{"value": "+32%", "label": "CTR Improvement", "description": "Compared to baseline creatives"}, {"value": "-18%", "label": "Cost Per Lead", "description": "Lower acquisition expenditure"}, {"value": "1.2k+", "label": "Verified Leads", "description": "Generated in first 60 days"}]}'::jsonb);

-- Project 3: Property Visual Production System
INSERT INTO portfolio_projects (
    id, title, slug, subtitle, description, category, cover_image_url, cover_image_alt, year, status, is_featured, display_order, client, role, published_at
) VALUES (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3',
    'Property Visual Production System',
    'property-visual-production-system',
    'AI-Accelerated Asset Engine',
    'A faster production process for property posters, cinematic visuals, and multi-format campaign assets.',
    'AI Creative Workflow',
    'https://picsum.photos/id/1043/1200/800',
    'Property Visual Production Preview',
    '2026',
    'published',
    false,
    3,
    'Creative Operations',
    'AI Workflow Engineer',
    NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Project 4: Content Activation for Property Agents
INSERT INTO portfolio_projects (
    id, title, slug, subtitle, description, category, cover_image_url, cover_image_alt, year, status, is_featured, display_order, client, role, published_at
) VALUES (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4',
    'Content Activation for Property Agents',
    'content-activation-for-property-agents',
    'Ecosystem Growth Program',
    'A structured program that connects content targets, internal communication, rewards, and publishing activity.',
    'Internal Campaign',
    'https://picsum.photos/id/119/1200/800',
    'Content Activation Preview',
    '2026',
    'published',
    false,
    4,
    'Internal Growth',
    'Campaign Lead',
    NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Project 5: Hot Listing Promotion Ecosystem
INSERT INTO portfolio_projects (
    id, title, slug, subtitle, description, category, cover_image_url, cover_image_alt, year, status, is_featured, display_order, client, role, published_at
) VALUES (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5',
    'Hot Listing Promotion Ecosystem',
    'hot-listing-promotion-ecosystem',
    'Multi-Channel Distribution',
    'One listing distributed through office displays, social media, agent broadcasts, AI posters, and Meta Ads.',
    'Listing Distribution',
    'https://picsum.photos/id/122/1200/800',
    'Hot Listing Promotion Preview',
    '2026',
    'published',
    false,
    5,
    'Sales Division',
    'Omnichannel Strategist',
    NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Project 6: Campaign Recap System
INSERT INTO portfolio_projects (
    id, title, slug, subtitle, description, category, cover_image_url, cover_image_alt, year, status, is_featured, display_order, client, role, published_at
) VALUES (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6',
    'Campaign Recap System',
    'campaign-recap-system',
    'Automated Analytics & Reporting',
    'A clearer reporting format for budget, clicks, WhatsApp responses, CTR, CPC, CPM, and next actions.',
    'Data and Reporting',
    'https://picsum.photos/id/48/1200/800',
    'Campaign Recap Preview',
    '2026',
    'published',
    false,
    6,
    'Marketing Operations',
    'Data & Reporting Specialist',
    NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Link Projects to Tags
INSERT INTO portfolio_project_tags (project_id, tag_id) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111101'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111102'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '11111111-1111-1111-1111-111111111103'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '11111111-1111-1111-1111-111111111104'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '11111111-1111-1111-1111-111111111105'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '11111111-1111-1111-1111-111111111106'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', '11111111-1111-1111-1111-111111111107'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5', '11111111-1111-1111-1111-111111111108'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6', '11111111-1111-1111-1111-111111111109')
ON CONFLICT DO NOTHING;
