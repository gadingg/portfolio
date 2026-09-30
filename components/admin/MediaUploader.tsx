'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { MediaLibraryModal } from './modals/MediaLibraryModal';

interface MediaUploaderProps {
  label?: string;
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
}

export function MediaUploader({ label = 'Cover Image (16:9)', value, onChange, folder = 'covers' }: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <label style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>
          {label}
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setIsLibraryOpen(true)}
            style={{
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              color: '#818CF8',
              borderRadius: '8px',
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            🖼️ Buka Media Library
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#F87171',
                borderRadius: '8px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Hapus
            </button>
          )}
        </div>
      </div>

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
            <Image src={value} alt="Uploaded preview" fill style={{ objectFit: 'cover' }} sizes="(max-width: 1024px) 100vw, 840px" />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0,0,0,0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: 0,
                transition: 'opacity 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
            >
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#fff',
                  padding: '8px 16px',
                  background: 'rgba(99, 102, 241, 0.85)',
                  borderRadius: '999px',
                }}
              >
                🔄 Klik / Drop untuk Ganti Gambar
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLibraryOpen(true);
                }}
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#fff',
                  padding: '8px 16px',
                  background: 'rgba(0,0,0,0.7)',
                  borderRadius: '999px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  cursor: 'pointer',
                }}
              >
                🖼️ Buka Galeri
              </button>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '24px' }}>
            <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>📁</span>
            <p style={{ margin: 0, fontSize: '13.5px', fontWeight: 600, color: 'var(--ink)' }}>
              {uploading ? 'Mengunggah ke Storage...' : 'Klik atau Drag & Drop Gambar (16:9) ke Sini'}
            </p>
            <span style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px', display: 'block' }}>
              Format JPG, PNG, WebP hingga 10MB
            </span>
            <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLibraryOpen(true);
                }}
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#818CF8',
                  background: 'rgba(99, 102, 241, 0.15)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                Pilih dari Media Library / Preset
              </button>
            </div>
          </div>
        )}
      </div>

      {error && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px' }}>{error}</p>}

      {/* Media Library Modal */}
      <MediaLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onSelect={(newUrl) => onChange(newUrl)}
        currentUrl={value}
        folder={folder}
        title={`Pilih ${label}`}
      />
    </div>
  );
}
