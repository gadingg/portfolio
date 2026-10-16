import { NextResponse } from 'next/server';
import { getPublishedProjects } from '@/lib/db/public-projects';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const projects = await getPublishedProjects();

    return NextResponse.json(
      { projects },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (error: any) {
    console.error('Failed to fetch public projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects', projects: [] },
      { status: 500 }
    );
  }
}
