import { createAdminClient } from '@/lib/supabase/admin';
import { Project, DashboardStats, ContentBlock } from '@/types/portfolio';

export async function getAllProjectsForAdmin(): Promise<Project[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('portfolio_projects')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Unable to load projects: ${error.message}`);
  return (data || []) as Project[];
}

export async function getAdminProjectById(id: string): Promise<Project | null> {
  const supabase = createAdminClient();
  const { data: project, error: projectError } = await supabase
    .from('portfolio_projects')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (projectError) throw new Error(`Unable to load project: ${projectError.message}`);
  if (!project) return null;

  const { data: blocks, error: blocksError } = await supabase
    .from('portfolio_content_blocks')
    .select('*')
    .eq('project_id', project.id)
    .order('block_order', { ascending: true });

  if (blocksError) throw new Error(`Unable to load project content: ${blocksError.message}`);
  return { ...(project as Project), blocks: (blocks || []) as ContentBlock[] };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const projects = await getAllProjectsForAdmin();
  return {
    totalPublished: projects.filter((project) => project.status === 'published').length,
    totalDrafts: projects.filter((project) => project.status === 'draft').length,
    totalProjects: projects.length,
    totalMedia: 0,
  };
}

export async function saveProject(
  projectData: Partial<Project>,
  blocksData?: Partial<ContentBlock>[]
): Promise<{ success: boolean; data?: Project; error?: string }> {
  try {
    const supabase = createAdminClient();
    const { blocks, tags, ...cleanProjectData } = projectData;
    const finalBlocks = blocksData || (blocks as Partial<ContentBlock>[]) || [];
    const normalizedBlocks = finalBlocks.map((block, index) => ({
      block_type: block.block_type || 'paragraph',
      block_order: index + 1,
      content_json: block.content_json || {},
    }));

    const { data, error } = await supabase.rpc('save_portfolio_project', {
      project_data: cleanProjectData,
      blocks_data: normalizedBlocks,
    });

    if (error) throw error;
    return { success: true, data: data as Project };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to save project',
    };
  }
}

export async function deleteProject(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from('portfolio_projects').delete().eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete project' };
  }
}

export async function toggleProjectStatus(
  id: string,
  newStatus: 'draft' | 'published'
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from('portfolio_projects')
      .update({
        status: newStatus,
        published_at: newStatus === 'published' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update status' };
  }
}
