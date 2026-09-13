export type ProjectStatus = 'draft' | 'published';

export type ContentBlockType =
  | 'heading'
  | 'paragraph'
  | 'image'
  | 'gallery'
  | 'video'
  | 'quote'
  | 'metrics'
  | 'list'
  | 'divider'
  | 'link';

export interface HeadingBlockContent {
  text: string;
  level: 2 | 3;
}

export interface ParagraphBlockContent {
  text: string;
}

export interface ImageBlockContent {
  url: string;
  alt: string;
  caption?: string;
  width_mode?: 'standard' | 'wide' | 'full';
}

export interface GalleryItem {
  url: string;
  alt: string;
  caption?: string;
}

export interface VisualArchiveItem {
  id: string;
  url: string;
  alt: string;
  caption?: string;
  category?: string;
  display_order: number;
}

export interface GalleryBlockContent {
  images: GalleryItem[];
  layout?: 'grid' | 'carousel';
}

export interface VideoBlockContent {
  url: string;
  poster?: string;
  caption?: string;
  autoplay?: boolean;
}

export interface QuoteBlockContent {
  quote: string;
  attribution?: string;
  role?: string;
}

export interface MetricItem {
  value: string;
  label: string;
  description?: string;
}

export interface MetricsBlockContent {
  items: MetricItem[];
}

export interface ListBlockContent {
  items: string[];
  ordered?: boolean;
}

export interface DividerBlockContent {
  style?: 'line' | 'dots' | 'space';
}

export interface LinkBlockContent {
  url: string;
  label: string;
  target?: '_blank' | '_self';
  description?: string;
}

export type BlockContentMap = {
  heading: HeadingBlockContent;
  paragraph: ParagraphBlockContent;
  image: ImageBlockContent;
  gallery: GalleryBlockContent;
  video: VideoBlockContent;
  quote: QuoteBlockContent;
  metrics: MetricsBlockContent;
  list: ListBlockContent;
  divider: DividerBlockContent;
  link: LinkBlockContent;
};

export interface ContentBlock<T extends ContentBlockType = ContentBlockType> {
  id: string;
  project_id: string;
  block_type: T;
  block_order: number;
  content_json: BlockContentMap[T];
  created_at?: string;
  updated_at?: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at?: string;
}

export interface ProjectMedia {
  id: string;
  project_id?: string | null;
  type: 'image' | 'video';
  url: string;
  storage_path: string;
  filename?: string;
  alt_text?: string;
  caption?: string;
  width?: number;
  height?: number;
  duration?: number;
  created_at?: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  subtitle?: string | null;
  description: string;
  category: string;
  cover_image_url: string;
  cover_image_alt?: string | null;
  year?: string | number | null;
  status: ProjectStatus;
  is_featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  published_at?: string | null;
  client?: string | null;
  role?: string | null;
  duration?: string | null;
  services?: string[] | null;
  tags?: Tag[] | string[];
  blocks?: ContentBlock[] | any[];
}

export type CardVariant = 'default' | 'featured' | 'wide' | 'compact' | 'minimal' | 'motion';

export interface DashboardStats {
  totalPublished: number;
  totalDrafts: number;
  totalProjects: number;
  totalMedia: number;
}
