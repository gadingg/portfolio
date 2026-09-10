'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';

interface MediaUploaderProps {
  label?: string;
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
}

export function MediaUploader({ label = 'Cover Image', value, onChange, folder = 'covers' }: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const res = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload');
      }

      onChange(data.url);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div style={{ marginBottom: '24px' }}>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px', color: 'var(--muted)' }}>
        {label}
      </label>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 9',
          borderRadius: '1.25rem',
          border: '2px dashed var(--border-strong)',
          background: 'var(--admin-card)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          overflow: 'hidden',
          transition: 'border-color 0.2s ease',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/mp4"
          style={{ display: 'none' }}
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        {value ? (
          <>
            <Image src={value} alt="Uploaded preview" fill style={{ objectFit: 'cover' }} />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0,0,0,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0,
                transition: 'opacity 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
            >
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff', padding: '8px 16px', background: 'rgba(0,0,0,0.6)', borderRadius: '999px' }}>
                Click or Drop to Replace
              </span>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '24px' }}>
            <span style={{ fontSize: '28px', display: 'block', marginBottom: '8px' }}>📁</span>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>
              {uploading ? 'Uploading to Storage...' : 'Click or Drag & Drop Image to Upload'}
            </p>
            <span style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px', display: 'block' }}>
              JPG, PNG, WebP up to 10MB
            </span>
          </div>
        )}
      </div>

      {error && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px' }}>{error}</p>}
    </div>
  );
}
