'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Project, ContentBlock, ContentBlockType } from '@/types/portfolio';
import { MediaUploader } from '../MediaUploader';
import { generateSlug } from '@/lib/utils/slug';

const CATEGORIES = [
  'Graphic Design',
  'Marketing Communication',
  'Performance Marketing',
  'Branding',
  'Web Development',
  'Digital Product',
  'AI Creative Workflow',
  'Gamification System',
  'Internal Campaign',
  'Listing Distribution',
  'Data and Reporting',
  'Other',
];

interface ContentEditorProps {
  initialProject?: Project | null;
  isNew?: boolean;
}

export function ContentEditor({ initialProject, isNew = false }: ContentEditorProps) {
  const router = useRouter();

  // Project Metadata State
  const [title, setTitle] = useState(initialProject?.title || '');
  const [slug, setSlug] = useState(initialProject?.slug || '');
  const [subtitle, setSubtitle] = useState(initialProject?.subtitle || '');
  const [description, setDescription] = useState(initialProject?.description || '');
  const [category, setCategory] = useState(initialProject?.category || CATEGORIES[0]);
  const [coverImageUrl, setCoverImageUrl] = useState(initialProject?.cover_image_url || 'https://picsum.photos/id/60/1200/800');
  const [year, setYear] = useState(initialProject?.year || '2026');
  const [client, setClient] = useState(initialProject?.client || '');
  const [role, setRole] = useState(initialProject?.role || '');
  const [isFeatured, setIsFeatured] = useState(initialProject?.is_featured || false);
  const [displayOrder, setDisplayOrder] = useState(initialProject?.display_order || 0);

  // Content Blocks State
  const [blocks, setBlocks] = useState<Partial<ContentBlock>[]>(
    initialProject?.blocks || [
      {
        id: 'init-1',
        block_type: 'heading',
        block_order: 1,
        content_json: { level: 2, text: 'The Challenge' },
      },
      {
        id: 'init-2',
        block_type: 'paragraph',
        block_order: 2,
        content_json: { text: 'Describe the core problem or brief in detail here...' },
      },
    ]
  );

  // UI state
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState('');
  const [publishing, setPublishing] = useState(false);
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-generate slug from title for new projects
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (isNew || !slug) {
      setSlug(generateSlug(val));
    }
  };

  // Block Manipulation Functions
  const addBlock = (type: ContentBlockType) => {
    let initialJson: any = {};
    if (type === 'heading') initialJson = { level: 2, text: 'New Section' };
    else if (type === 'paragraph') initialJson = { text: 'Enter paragraph text...' };
    else if (type === 'image') initialJson = { url: 'https://picsum.photos/id/1043/1200/800', alt: 'Image description', width_mode: 'standard' };
    else if (type === 'metrics') initialJson = { items: [{ value: '+45%', label: 'Metric Label', description: 'Growth measurement' }] };
    else if (type === 'quote') initialJson = { quote: 'Inspiring project takeaway', attribution: 'Gading Utama' };
    else if (type === 'video') initialJson = { url: 'https://vjs.zencdn.net/v/oceans.mp4', poster: '' };
    else if (type === 'list') initialJson = { items: ['Key takeaway item 1', 'Key takeaway item 2'] };
    else if (type === 'divider') initialJson = { style: 'line' };
    else if (type === 'link') initialJson = { label: 'Open Live Demo', url: 'https://example.com' };

    setBlocks((prev) => [
      ...prev,
      {
        id: `block-${Date.now()}`,
        block_type: type,
        block_order: prev.length + 1,
        content_json: initialJson,
      },
    ]);
  };

  const updateBlockContent = (index: number, content: any) => {
    setBlocks((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], content_json: content };
      return next;
    });
  };

  const removeBlock = (index: number) => {
    setBlocks((prev) => prev.filter((_, i) => i !== index));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    setBlocks((prev) => {
      const next = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= next.length) return prev;
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next;
    });
  };

  const duplicateBlock = (index: number) => {
    setBlocks((prev) => {
      const next = [...prev];
      const clone = {
        ...next[index],
        id: `block-${Date.now()}`,
      };
      next.splice(index + 1, 0, clone);
      return next;
    });
  };

  // Save logic (Draft or Published)
  const handleSave = useCallback(async (status: 'draft' | 'published' = 'draft') => {
    if (!title || !slug || !description) {
      setSaveStatus('error');
      setSaveMessage('Title, slug, and description are required.');
      return;
    }

    setSaveStatus('saving');
    setSaveMessage('Saving...');

    try {
      const payload = {
        id: initialProject?.id,
        title,
        slug,
        subtitle,
        description,
        category,
        cover_image_url: coverImageUrl,
        year,
        client,
        role,
        status,
        is_featured: isFeatured,
        display_order: Number(displayOrder) || 0,
        blocks,
      };

      const url = initialProject?.id ? `/api/admin/projects/${initialProject.id}` : '/api/admin/projects';
      const method = initialProject?.id ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save');
      }

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setSaveStatus('saved');
      setSaveMessage(`Saved at ${timeStr}`);

      if (isNew && data.project?.id) {
        router.push(`/admintgadink/dashboard/portfolio/${data.project.id}`);
      }
    } catch (err: any) {
      setSaveStatus('error');
      setSaveMessage(err.message || 'Save failed');
    }
  }, [
    title,
    slug,
    description,
    subtitle,
    category,
    coverImageUrl,
    year,
    client,
    role,
    isFeatured,
    displayOrder,
    blocks,
    initialProject?.id,
    isNew,
    router,
  ]);

  // Debounced Autosave (1.5s after editing)
  useEffect(() => {
    if (isNew) return; // Don't autosave while creating new before first manual save

    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    autosaveTimerRef.current = setTimeout(() => {
      if (title && slug) {
        handleSave(initialProject?.status || 'draft');
      }
    }, 1800);

    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, [title, slug, subtitle, description, category, coverImageUrl, year, client, role, isFeatured, displayOrder, blocks, isNew, initialProject?.status, handleSave]);

  const handlePublishToggle = async () => {
    setPublishing(true);
    const nextStatus = initialProject?.status === 'published' ? 'draft' : 'published';
    await handleSave(nextStatus);
    setPublishing(false);
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', paddingBottom: '80px' }}>
      {/* Header action bar */}
      <div
        style={{
          position: 'sticky',
          top: '20px',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          borderRadius: '1.25rem',
          background: 'rgba(18, 24, 32, 0.95)',
          border: '1px solid var(--border-strong)',
          backdropFilter: 'blur(20px)',
          marginBottom: '32px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)' }}>
            {isNew ? 'New Study Case' : 'Edit Study Case'}
          </span>
          <span
            style={{
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '999px',
              background: initialProject?.status === 'published' ? '#34d39922' : '#fbbf2422',
              color: initialProject?.status === 'published' ? '#34d399' : '#fbbf24',
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            {initialProject?.status || 'Draft'}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--muted)', marginLeft: '8px' }}>
            {saveMessage}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {slug && (
            <a
              href={`/work/${slug}`}
              target="_blank"
              rel="noreferrer"
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--muted)',
                padding: '8px 14px',
              }}
            >
              Public View ↗
            </a>
          )}

          <button
            type="button"
            onClick={() => handleSave('draft')}
            disabled={saveStatus === 'saving'}
            className="button button--secondary"
            style={{ padding: '10px 18px', minHeight: '38px', fontSize: '11px' }}
          >
            Save Draft
          </button>

          <button
            type="button"
            onClick={handlePublishToggle}
            disabled={publishing || saveStatus === 'saving'}
            className="button button--primary"
            style={{ padding: '10px 20px', minHeight: '38px', fontSize: '11px' }}
          >
            {initialProject?.status === 'published' ? 'Unpublish' : 'Publish'}
          </button>
        </div>
      </div>

      {/* Metadata Form */}
      <div
        style={{
          padding: '32px',
          borderRadius: '1.5rem',
          background: 'var(--admin-card)',
          border: '1px solid var(--admin-card-border)',
          marginBottom: '36px',
        }}
      >
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 24px', letterSpacing: '-0.02em' }}>
          Project Metadata
        </h2>

        {/* Title */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px', color: 'var(--muted)' }}>
            Project Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="e.g. PROGRAM MBG Real-Time Leaderboard"
            style={{
              width: '100%',
              padding: '14px 18px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border)',
              color: 'var(--ink)',
              fontSize: '16px',
              fontWeight: 600,
              outline: 'none',
            }}
          />
        </div>

        {/* URL Slug */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px', color: 'var(--muted)' }}>
            URL Slug (Unique URL Path) *
          </label>
          <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', border: '1px solid var(--border)', padding: '0 16px' }}>
            <span style={{ fontSize: '13px', color: 'var(--muted)', fontFamily: 'monospace' }}>/work/</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
              style={{
                width: '100%',
                padding: '14px 8px',
                background: 'transparent',
                border: 'none',
                color: 'var(--amber)',
                fontSize: '14px',
                fontFamily: 'monospace',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Category & Year */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px', color: 'var(--muted)' }}>
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 18px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--border)',
                color: 'var(--ink)',
                fontSize: '14px',
                outline: 'none',
              }}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px', color: 'var(--muted)' }}>
              Year
            </label>
            <input
              type="text"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="2026"
              style={{
                width: '100%',
                padding: '14px 18px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--border)',
                color: 'var(--ink)',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Subtitle */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px', color: 'var(--muted)' }}>
            Subtitle / One-Line Summary
          </label>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="e.g. Gamification & Activity Tracking System"
            style={{
              width: '100%',
              padding: '14px 18px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border)',
              color: 'var(--ink)',
              fontSize: '14px',
              outline: 'none',
            }}
          />
        </div>

        {/* Description */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px', color: 'var(--muted)' }}>
            Homepage Overview Description *
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A short punchy description that appears on the card and study case intro..."
            style={{
              width: '100%',
              padding: '14px 18px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border)',
              color: 'var(--ink)',
              fontSize: '14px',
              lineHeight: 1.6,
              outline: 'none',
            }}
          />
        </div>

        {/* Cover Image Uploader */}
        <MediaUploader
          label="Project Cover Image"
          value={coverImageUrl}
          onChange={setCoverImageUrl}
          folder="covers"
        />

        {/* Client, Role & Featured */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginTop: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px', color: 'var(--muted)' }}>
              Client / Division
            </label>
            <input
              type="text"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              placeholder="e.g. Internal Company"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--border)',
                color: 'var(--ink)',
                fontSize: '13px',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px', color: 'var(--muted)' }}>
              Your Role
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. System Architect"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--border)',
                color: 'var(--ink)',
                fontSize: '13px',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', paddingTop: '24px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                style={{ width: '18px', height: '18px' }}
              />
              Featured Project (Top priority / Wide Card)
            </label>
          </div>
        </div>
      </div>

      {/* Content Blocks Section (Medium-Style Block Editor) */}
      <div
        style={{
          padding: '32px',
          borderRadius: '1.5rem',
          background: 'var(--admin-card)',
          border: '1px solid var(--admin-card-border)',
          marginBottom: '36px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
              Study Case Content Blocks
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '4px 0 0' }}>
              Add and reorder modular blocks to structure your editorial case study.
            </p>
          </div>
        </div>

        {/* Blocks List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
          {blocks.map((block, index) => {
            const content = (block.content_json || {}) as any;

            return (
              <div
                key={block.id || index}
                style={{
                  padding: '20px',
                  borderRadius: '1rem',
                  background: 'rgba(255,255,255,0.025)',
                  border: '1px solid var(--border)',
                }}
              >
                {/* Block Header & Controls */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      letterSpacing: '0.15em',
                      color: 'var(--amber)',
                      textTransform: 'uppercase',
                    }}
                  >
                    #{index + 1} {block.block_type} Block
                  </span>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => moveBlock(index, 'up')}
                      disabled={index === 0}
                      style={{ padding: '4px 8px', borderRadius: '6px', background: 'var(--surface)', border: 'none', color: 'var(--ink)', cursor: 'pointer' }}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveBlock(index, 'down')}
                      disabled={index === blocks.length - 1}
                      style={{ padding: '4px 8px', borderRadius: '6px', background: 'var(--surface)', border: 'none', color: 'var(--ink)', cursor: 'pointer' }}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => duplicateBlock(index)}
                      style={{ padding: '4px 8px', borderRadius: '6px', background: 'var(--surface)', border: 'none', color: 'var(--ink)', cursor: 'pointer', fontSize: '11px' }}
                    >
                      Duplicate
                    </button>
                    <button
                      type="button"
                      onClick={() => removeBlock(index)}
                      style={{ padding: '4px 8px', borderRadius: '6px', background: 'rgba(239,68,68,0.1)', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '11px' }}
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {/* Block Inputs based on type */}
                {block.block_type === 'heading' && (
                  <div>
                    <input
                      type="text"
                      value={content.text || ''}
                      onChange={(e) => updateBlockContent(index, { ...content, text: e.target.value })}
                      placeholder="Section Heading Text..."
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid var(--border)',
                        color: 'var(--ink)',
                        fontSize: '16px',
                        fontWeight: 600,
                        outline: 'none',
                      }}
                    />
                  </div>
                )}

                {block.block_type === 'paragraph' && (
                  <div>
                    <textarea
                      rows={4}
                      value={content.text || ''}
                      onChange={(e) => updateBlockContent(index, { ...content, text: e.target.value })}
                      placeholder="Write your in-depth case study explanation..."
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '8px',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid var(--border)',
                        color: 'var(--ink)',
                        fontSize: '14px',
                        lineHeight: 1.6,
                        outline: 'none',
                      }}
                    />
                  </div>
                )}

                {block.block_type === 'image' && (
                  <div>
                    <input
                      type="text"
                      value={content.url || ''}
                      onChange={(e) => updateBlockContent(index, { ...content, url: e.target.value })}
                      placeholder="Image URL..."
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid var(--border)',
                        color: 'var(--ink)',
                        fontSize: '13px',
                        marginBottom: '8px',
                        outline: 'none',
                      }}
                    />
                    <input
                      type="text"
                      value={content.caption || ''}
                      onChange={(e) => updateBlockContent(index, { ...content, caption: e.target.value })}
                      placeholder="Caption (optional)..."
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid var(--border)',
                        color: 'var(--muted)',
                        fontSize: '12px',
                        outline: 'none',
                      }}
                    />
                  </div>
                )}

                {block.block_type === 'metrics' && (
                  <div>
                    <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '0 0 10px' }}>
                      Metrics Items (Value & Label)
                    </p>
                    {(content.items || []).map((m: any, mIdx: number) => (
                      <div key={mIdx} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                        <input
                          type="text"
                          value={m.value}
                          onChange={(e) => {
                            const nextItems = [...(content.items || [])];
                            nextItems[mIdx] = { ...nextItems[mIdx], value: e.target.value };
                            updateBlockContent(index, { ...content, items: nextItems });
                          }}
                          placeholder="+32%"
                          style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--amber)', fontWeight: 700 }}
                        />
                        <input
                          type="text"
                          value={m.label}
                          onChange={(e) => {
                            const nextItems = [...(content.items || [])];
                            nextItems[mIdx] = { ...nextItems[mIdx], label: e.target.value };
                            updateBlockContent(index, { ...content, items: nextItems });
                          }}
                          placeholder="CTR Growth"
                          style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--ink)' }}
                        />
                        <input
                          type="text"
                          value={m.description || ''}
                          onChange={(e) => {
                            const nextItems = [...(content.items || [])];
                            nextItems[mIdx] = { ...nextItems[mIdx], description: e.target.value };
                            updateBlockContent(index, { ...content, items: nextItems });
                          }}
                          placeholder="Compared to baseline"
                          style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--muted)', fontSize: '12px' }}
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const nextItems = [...(content.items || []), { value: '+0%', label: 'Metric', description: '' }];
                        updateBlockContent(index, { ...content, items: nextItems });
                      }}
                      style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '6px', background: 'var(--surface)', border: 'none', color: 'var(--ink)', cursor: 'pointer', marginTop: '6px' }}
                    >
                      + Add Metric Point
                    </button>
                  </div>
                )}

                {block.block_type === 'quote' && (
                  <div>
                    <textarea
                      rows={2}
                      value={content.quote || ''}
                      onChange={(e) => updateBlockContent(index, { ...content, quote: e.target.value })}
                      placeholder="Quote text..."
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid var(--border)',
                        color: 'var(--ink)',
                        fontSize: '14px',
                        fontStyle: 'italic',
                        marginBottom: '8px',
                        outline: 'none',
                      }}
                    />
                    <input
                      type="text"
                      value={content.attribution || ''}
                      onChange={(e) => updateBlockContent(index, { ...content, attribution: e.target.value })}
                      placeholder="Attribution / Author..."
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid var(--border)',
                        color: 'var(--muted)',
                        fontSize: '12px',
                        outline: 'none',
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Add Block Palette */}
        <div>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '12px' }}>
            + Add Content Block
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button type="button" onClick={() => addBlock('heading')} className="button button--secondary" style={{ padding: '8px 16px', fontSize: '11px' }}>
              + Heading
            </button>
            <button type="button" onClick={() => addBlock('paragraph')} className="button button--secondary" style={{ padding: '8px 16px', fontSize: '11px' }}>
              + Paragraph
            </button>
            <button type="button" onClick={() => addBlock('image')} className="button button--secondary" style={{ padding: '8px 16px', fontSize: '11px' }}>
              + Image
            </button>
            <button type="button" onClick={() => addBlock('metrics')} className="button button--secondary" style={{ padding: '8px 16px', fontSize: '11px' }}>
              + Metrics
            </button>
            <button type="button" onClick={() => addBlock('quote')} className="button button--secondary" style={{ padding: '8px 16px', fontSize: '11px' }}>
              + Quote
            </button>
            <button type="button" onClick={() => addBlock('video')} className="button button--secondary" style={{ padding: '8px 16px', fontSize: '11px' }}>
              + Video
            </button>
            <button type="button" onClick={() => addBlock('list')} className="button button--secondary" style={{ padding: '8px 16px', fontSize: '11px' }}>
              + List
            </button>
            <button type="button" onClick={() => addBlock('divider')} className="button button--secondary" style={{ padding: '8px 16px', fontSize: '11px' }}>
              + Divider
            </button>
            <button type="button" onClick={() => addBlock('link')} className="button button--secondary" style={{ padding: '8px 16px', fontSize: '11px' }}>
              + Button Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
