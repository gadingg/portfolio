import React from 'react';
import { notFound } from 'next/navigation';
import { getAdminProjectById } from '@/lib/db/projects';
import { ContentEditor } from '@/components/admin/editor/ContentEditor';

export default async function EditStudyCasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getAdminProjectById(id);

  if (!project) {
    notFound();
  }

  return <ContentEditor initialProject={project} isNew={false} />;
}
