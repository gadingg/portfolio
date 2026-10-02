import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/session';
import { getAllProjectsForAdmin, saveProject } from '@/lib/db/projects';
import { ProjectSchema } from '@/lib/validation/project.schema';

export async function GET() {
  const isAuth = await verifyAdminSession();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const projects = await getAllProjectsForAdmin();
  return NextResponse.json({ projects });
}

export async function POST(request: NextRequest) {
  const isAuth = await verifyAdminSession();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validatedData = ProjectSchema.parse(body);

    const result = await saveProject(validatedData, validatedData.blocks);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    revalidateTag('portfolio-projects');
    return NextResponse.json({ success: true, project: result.data });
  } catch (error: any) {
    console.error('Project create error:', error);
    return NextResponse.json({ error: 'Project could not be saved. Check the required fields and try again.' }, { status: 400 });
  }
}
