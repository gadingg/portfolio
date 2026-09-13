'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { VisualArchiveItem } from '@/types/portfolio';

interface GalleryManagerProps {
  initialItems: VisualArchiveItem[];
}

export function GalleryManager({ initialItems }: GalleryManagerProps) {
  const [items, setItems] = useState<VisualArchiveItem[]>(initialItems);
  const [isUploading, setIsUploading] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [draggedCardIndex, setDraggedCardIndex] = useState<number | null>(null);
  const [dragOverCardIndex, setDragOverCardIndex] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Show status toast
  const notify = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // --- FILE DRAG & DROP / UPLOAD HANDLERS ---
  const handleFileDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingFile(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await uploadFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await uploadFiles(Array.from(e.target.files));
    }
  };

  const uploadFiles = async (files: File[]) => {
    setIsUploading(true);
    let addedCount = 0;

    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'gallery');

        const uploadRes = await fetch('/api/admin/media', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) throw new Error('Upload failed');
        const uploadData = await uploadRes.json();

        // Add to gallery
        const addRes = await fetch('/api/admin/gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'add',
            item: {
              url: uploadData.url,
              alt: file.name.replace(/\.[^/.]+$/, ''),
              caption: 'Uploaded visual asset',
              category: 'Archive',
            },
          }),
        });

        if (addRes.ok) {
          const resData = await addRes.json();
          if (resData.items) {
            setItems(resData.items);
            addedCount++;
          }
        }
      } catch (err: any) {
        console.error('File upload error:', err);
      }
    }

    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';

    if (addedCount > 0) {
      notify(`Successfully added ${addedCount} new image(s) to gallery!`, 'success');
    } else {
      notify('Failed to upload images. Please check file formats.', 'error');
    }
  };

  // --- CARD REORDERING (DRAG & DROP) ---
  const handleCardDragStart = (index: number) => {
    setDraggedCardIndex(index);
  };

  const handleCardDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedCardIndex !== index) {
      setDragOverCardIndex(index);
    }
  };

  const handleCardDragEnd = () => {
    setDraggedCardIndex(null);
    setDragOverCardIndex(null);
  };

  const handleCardDrop = async (dropIndex: number) => {
    if (draggedCardIndex === null || draggedCardIndex === dropIndex) {
      setDraggedCardIndex(null);
      setDragOverCardIndex(null);
      return;
    }

    const reordered = [...items];
    const [draggedItem] = reordered.splice(draggedCardIndex, 1);
    reordered.splice(dropIndex, 0, draggedItem);

    // Update display orders
    const normalized = reordered.map((item, idx) => ({
      ...item,
      display_order: idx + 1,
    }));

    setItems(normalized);
    setDraggedCardIndex(null);
    setDragOverCardIndex(null);

    // Auto-save new order
    await saveAll(normalized, 'Order updated successfully!');
  };

  // Move manual Up / Down
  const moveItem = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const reordered = [...items];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    const normalized = reordered.map((item, idx) => ({
      ...item,
      display_order: idx + 1,
    }));

    setItems(normalized);
    await saveAll(normalized, 'Order updated successfully!');
  };

  // Delete item
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this image from the gallery?')) return;

    try {
      const res = await fetch('/api/admin/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id }),
      });

      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
        notify('Image removed from gallery.', 'success');
      } else {
        notify('Failed to delete image.', 'error');
      }
    } catch {
      notify('Network error when deleting image.', 'error');
    }
  };

  // Save all items (order and metadata)
  const saveAll = async (itemsToSave = items, successMsg = 'Gallery saved successfully!') => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: itemsToSave }),
      });

      if (res.ok) {
        const data = await res.json();
        setItems(data.items || itemsToSave);
        notify(successMsg, 'success');
      } else {
        notify('Failed to save gallery changes.', 'error');
      }
    } catch {
      notify('Network error while saving gallery.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Inline edit field
  const updateField = (id: string, field: keyof VisualArchiveItem, value: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  return (
    <div style={{ maxWidth: '1100px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em', color: 'var(--amber)' }}>
            VISUAL ARCHIVE CMS
          </span>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 600, letterSpacing: '-0.03em', margin: '6px 0 0' }}>
            Gallery Manager
          </h1>
          <p style={{ margin: '8px 0 0', fontSize: '13px', color: 'var(--muted)' }}>
            Drag and drop images to upload or reorder. Changes sync directly to the homepage Visual Archive section.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link
            href="/#portfolio-gallery"
            target="_blank"
            style={{
              padding: '10px 18px',
              borderRadius: '999px',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--ink)',
              fontSize: '12px',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Preview on Site ↗
          </Link>
          <button
            type="button"
            onClick={() => saveAll()}
            disabled={isSaving}
            className="button button--primary"
            style={{ padding: '10px 24px' }}
          >
            {isSaving ? 'SAVING...' : 'SAVE CHANGES'}
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {statusMessage && (
        <div
          style={{
            padding: '12px 20px',
            borderRadius: '12px',
            marginBottom: '24px',
            fontSize: '13px',
            fontWeight: 600,
            background: statusMessage.type === 'success' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            color: statusMessage.type === 'success' ? '#34d399' : '#ef4444',
            border: `1px solid ${statusMessage.type === 'success' ? 'rgba(52, 211, 153, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          }}
        >
          {statusMessage.text}
        </div>
      )}

      {/* Drag & Drop File Upload Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDraggingFile(true);
        }}
        onDragLeave={() => setIsDraggingFile(false)}
        onDrop={handleFileDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${isDraggingFile ? 'var(--amber)' : 'var(--border-strong)'}`,
          borderRadius: '1.25rem',
          padding: '44px 24px',
          textAlign: 'center',
          background: isDraggingFile ? 'rgba(255, 90, 31, 0.05)' : 'var(--admin-card)',
          cursor: 'pointer',
          marginBottom: '36px',
          transition: 'all 0.2s ease',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif"
          style={{ display: 'none' }}
          onChange={handleFileInputChange}
        />

        <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', background: 'rgba(255, 90, 31, 0.1)', color: 'var(--amber)', marginBottom: '14px' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>

        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 6px', color: 'var(--ink)' }}>
          {isUploading ? 'Uploading and processing images...' : 'Drag & drop image files here'}
        </h3>
        <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted)' }}>
          or <span style={{ color: 'var(--amber)', fontWeight: 600 }}>browse from computer</span> (JPG, PNG, WebP up to 10MB)
        </p>
      </div>

      {/* Gallery Cards List (Reorderable) */}
      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0 }}>
          Gallery Cards ({items.length})
        </h2>
        <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
          Tip: Grab the card or handle to drag and drop reorder.
        </span>
      </div>

      {items.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', background: 'var(--admin-card)', borderRadius: '1rem', border: '1px solid var(--border)' }}>
          <p style={{ color: 'var(--muted)', fontSize: '14px' }}>No gallery images yet. Drop photos above to start!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {items.map((item, index) => {
            const isBeingDragged = draggedCardIndex === index;
            const isDragOver = dragOverCardIndex === index;

            return (
              <div
                key={item.id}
                draggable
                onDragStart={() => handleCardDragStart(index)}
                onDragOver={(e) => handleCardDragOver(e, index)}
                onDragEnd={handleCardDragEnd}
                onDrop={() => handleCardDrop(index)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  padding: '16px 20px',
                  borderRadius: '1.25rem',
                  background: isBeingDragged ? 'rgba(255, 90, 31, 0.08)' : 'var(--admin-card)',
                  border: isDragOver ? '2px solid var(--amber)' : isBeingDragged ? '1px dashed var(--amber)' : '1px solid var(--admin-card-border)',
                  opacity: isBeingDragged ? 0.6 : 1,
                  transform: isDragOver ? 'scale(1.01)' : 'none',
                  transition: 'all 0.15s ease',
                  cursor: 'grab',
                }}
              >
                {/* Drag Handle & Order Badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '70px' }}>
                  <span style={{ color: 'var(--muted)', cursor: 'grab', fontSize: '18px' }} title="Drag to reorder">
                    ⋮⋮
                  </span>
                  <span
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 800,
                      color: 'var(--amber)',
                    }}
                  >
                    {item.display_order || index + 1}
                  </span>
                </div>

                {/* Thumbnail Preview */}
                <div
                  style={{
                    width: '80px',
                    height: '96px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: '#141714',
                    flexShrink: 0,
                    border: '1px solid var(--border)',
                  }}
                >
                  <img
                    src={item.url}
                    alt={item.alt || 'Thumbnail'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                {/* Edit Fields */}
                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.1em' }}>
                      Alt / Title
                    </label>
                    <input
                      type="text"
                      value={item.alt || ''}
                      onChange={(e) => updateField(item.id, 'alt', e.target.value)}
                      onBlur={() => saveAll(items, 'Saved')}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--border)',
                        color: 'var(--ink)',
                        fontSize: '13px',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.1em' }}>
                      Caption / Description
                    </label>
                    <input
                      type="text"
                      value={item.caption || ''}
                      onChange={(e) => updateField(item.id, 'caption', e.target.value)}
                      onBlur={() => saveAll(items, 'Saved')}
                      placeholder="Optional caption..."
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--border)',
                        color: 'var(--ink)',
                        fontSize: '13px',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.1em' }}>
                      Category Tag
                    </label>
                    <input
                      type="text"
                      value={item.category || ''}
                      onChange={(e) => updateField(item.id, 'category', e.target.value)}
                      onBlur={() => saveAll(items, 'Saved')}
                      placeholder="e.g. Visual Identity"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--border)',
                        color: 'var(--ink)',
                        fontSize: '13px',
                      }}
                    />
                  </div>
                </div>

                {/* Move Controls & Delete */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => moveItem(index, 'up')}
                    disabled={index === 0}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      background: 'var(--surface)',
                      color: index === 0 ? 'var(--muted)' : 'var(--ink)',
                      cursor: index === 0 ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                    }}
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveItem(index, 'down')}
                    disabled={index === items.length - 1}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      background: 'var(--surface)',
                      color: index === items.length - 1 ? 'var(--muted)' : 'var(--ink)',
                      cursor: index === items.length - 1 ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                    }}
                    title="Move down"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      background: 'rgba(239, 68, 68, 0.08)',
                      color: '#ef4444',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      marginLeft: '4px',
                    }}
                    title="Delete image"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
