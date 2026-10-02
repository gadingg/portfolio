import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/session';
import { getAdminProjectById, saveProject, deleteProject } from '@/lib/db/projects';
import { ProjectSchema } from '@/lib/validation/project.schema';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuth = await verifyAdminSession();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const project = await getAdminProjectById(id);

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  return NextResponse.json({ project });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuth = await verifyAdminSession();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const validatedData = ProjectSchema.partial().parse({ ...body, id });

    const result = await saveProject(validatedData, validatedData.blocks);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    revalidateTag('portfolio-projects');
    return NextResponse.json({ success: true, project: result.data });
  } catch (error) {
    console.error('Project update error:', error);
    return NextResponse.json({ error: 'Project could not be updated. Check the fields and try again.' }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuth = await verifyAdminSession();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const result = await deleteProject(id);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  revalidateTag('portfolio-projects');
  return NextResponse.json({ success: true });
}
