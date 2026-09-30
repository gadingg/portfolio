import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { verifyAdminSession } from '@/lib/auth/session';
import { createAdminClient } from '@/lib/supabase/admin';

// Curated 16:9 high-resolution design presets for instant dummy & portfolio mockups
const CURATED_16_9_PRESETS = [
  {
    id: 'preset-1',
    name: 'Executive Analytics Dashboard Mockup',
    category: 'UI/UX & Web Apps',
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1280&h=720&q=80',
    aspect: '16:9',
    source: 'preset'
  },
  {
    id: 'preset-2',
    name: 'Mobile Fintech & Crypto App UI',
    category: 'Mobile & Dashboards',
    url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1280&h=720&q=80',
    aspect: '16:9',
    source: 'preset'
  },
  {
    id: 'preset-3',
    name: 'SaaS Design System & Design Tokens',
    category: 'UI/UX & Web Apps',
    url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1280&h=720&q=80',
    aspect: '16:9',
    source: 'preset'
  },
  {
    id: 'preset-4',
    name: 'Luxury Property Architecture & Branding',
    category: 'Brand & Creatives',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1280&h=720&q=80',
    aspect: '16:9',
    source: 'preset'
  },
  {
    id: 'preset-5',
    name: 'AI Creative Automation & Workflow Engine',
    category: 'UI/UX & Web Apps',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1280&h=720&q=80',
    aspect: '16:9',
    source: 'preset'
  },
  {
    id: 'preset-6',
    name: 'High-Impact Performance Marketing Campaign',
    category: 'Brand & Creatives',
    url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1280&h=720&q=80',
    aspect: '16:9',
    source: 'preset'
  },
  {
    id: 'preset-7',
    name: 'Minimalist Productivity Task & Habit Tracker',
    category: 'Mobile & Dashboards',
    url: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=1280&h=720&q=80',
    aspect: '16:9',
    source: 'preset'
  },
  {
    id: 'preset-8',
    name: 'Modern Web Design Studio Showcase',
    category: 'UI/UX & Web Apps',
    url: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=1280&h=720&q=80',
    aspect: '16:9',
    source: 'preset'
  }
];

export async function GET(request: NextRequest) {
  const isAuth = await verifyAdminSession();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    const folder = request.nextUrl.searchParams.get('folder') || 'covers';

    const uploadedItems: any[] = [];

    // Try fetching files from Supabase Storage bucket
    const { data: files, error } = await supabase.storage
      .from('portfolio-public')
      .list(folder, {
        limit: 50,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (!error && Array.isArray(files)) {
      for (const file of files) {
        if (!file.name || file.name.startsWith('.')) continue;
        const storagePath = `${folder}/${file.name}`;
        const { data: publicUrlData } = supabase.storage
          .from('portfolio-public')
          .getPublicUrl(storagePath);

        uploadedItems.push({
          id: file.id || file.name,
          name: file.name,
          category: 'Uploaded Storage',
          url: publicUrlData.publicUrl,
          aspect: '16:9',
          created_at: file.created_at,
          source: 'storage',
        });
      }
    }

    return NextResponse.json({
      success: true,
      uploads: uploadedItems,
      presets: CURATED_16_9_PRESETS,
      all: [...uploadedItems, ...CURATED_16_9_PRESETS],
    });
  } catch (error: any) {
    console.warn('Media list warning:', error);
    // Return presets gracefully even if storage is offline
    return NextResponse.json({
      success: true,
      uploads: [],
      presets: CURATED_16_9_PRESETS,
      all: CURATED_16_9_PRESETS,
    });
  }
}

export async function POST(request: NextRequest) {
  const isAuth = await verifyAdminSession();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'covers';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate size (max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 });
    }

    // Validate mime type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Unsupported file type. Use JPG, PNG, WebP, GIF, MP4, or WebM.' }, { status: 400 });
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const storagePath = `${folder}/${cleanFileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Try Supabase Storage first if configured
    try {
      const supabase = createAdminClient();
      const { error: uploadError } = await supabase.storage
        .from('portfolio-public')
        .upload(storagePath, buffer, {
          contentType: file.type,
          upsert: true,
        });

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage
          .from('portfolio-public')
          .getPublicUrl(storagePath);

        if (publicUrlData?.publicUrl) {
          return NextResponse.json({
            url: publicUrlData.publicUrl,
            storage_path: storagePath,
            filename: file.name,
          });
        }
      }
    } catch {
      // Supabase not available, fall through to local file storage
    }

    // Local file fallback: save to /public/uploads/
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const localFilePath = path.join(uploadsDir, cleanFileName);
    fs.writeFileSync(localFilePath, buffer);

    const localUrl = `/uploads/${cleanFileName}`;

    return NextResponse.json({
      url: localUrl,
      storage_path: `local/${cleanFileName}`,
      filename: file.name,
    });
  } catch (error: any) {
    console.error('Upload processing error:', error);
    return NextResponse.json({ error: error.message || 'Failed to upload media' }, { status: 500 });
  }
}
