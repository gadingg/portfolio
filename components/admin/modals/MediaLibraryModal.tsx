'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface MediaItem {
  id: string;
  name: string;
  category: string;
  url: string;
  aspect?: string;
  source?: 'storage' | 'preset';
}

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  currentUrl?: string;
  title?: string;
  folder?: string;
}

export function MediaLibraryModal({
  isOpen,
  onClose,
  onSelect,
  currentUrl,
  title = 'Media Library & Asset Manager',
  folder = 'covers',
}: MediaLibraryModalProps) {
  const [activeTab, setActiveTab] = useState<'gallery' | 'upload' | 'url'>('gallery');
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [customUrl, setCustomUrl] = useState('');
  const [urlPreviewValid, setUrlPreviewValid] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
      if (currentUrl) {
        setCustomUrl(currentUrl);
        setUrlPreviewValid(true);
      }
    }
  }, [isOpen, folder, currentUrl]);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/media?folder=${folder}`);
      const data = await res.json();
      if (data.all) {
        setMediaList(data.all);
      }
    } catch (err) {
      console.warn('Error fetching media:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const res = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      onSelect(data.url);
      onClose();
    } catch (err: any) {
      setUploadError(err.message || 'Gagal mengunggah gambar');
    } finally {
      setUploading(false);
    }
  };

  const handleSelectImage = (url: string) => {
    onSelect(url);
    onClose();
  };

  if (!isOpen) return null;

  const categories = ['All', 'Uploaded Storage', 'UI/UX & Web Apps', 'Mobile & Dashboards', 'Brand & Creatives'];
  const filteredList = mediaList.filter((item) => {
    if (selectedFilter === 'All') return true;
    return item.category === selectedFilter;
  });

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.82)',
        backdropFilter: 'blur(12px)',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '920px',
          maxHeight: '90vh',
          background: '#0D111A',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '1.75rem',
          boxShadow: '0 25px 60px -10px rgba(0,0,0,0.7), inset 0 1px 1px rgba(255,255,255,0.1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: '#fff',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '24px 28px 16px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0, letterSpacing: '-0.02em', color: '#F8FAFC' }}>
              {title}
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#94A3B8' }}>
              Pilih dari galeri aset 16:9, unggah file baru, atau tempel URL gambar eksternal.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              color: '#CBD5E1',
              cursor: 'pointer',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* Tab Controls */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            padding: '12px 28px',
            background: 'rgba(0, 0, 0, 0.25)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          <button
            onClick={() => setActiveTab('gallery')}
            style={{
              padding: '8px 18px',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              background: activeTab === 'gallery' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              color: activeTab === 'gallery' ? '#818CF8' : '#94A3B8',
              outline: activeTab === 'gallery' ? '1px solid rgba(99, 102, 241, 0.4)' : 'none',
            }}
          >
            🖼️ Galeri Media (16:9 Presets & Uploads)
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            style={{
              padding: '8px 18px',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              background: activeTab === 'upload' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              color: activeTab === 'upload' ? '#818CF8' : '#94A3B8',
              outline: activeTab === 'upload' ? '1px solid rgba(99, 102, 241, 0.4)' : 'none',
            }}
          >
            ⬆️ Upload File Baru
          </button>
          <button
            onClick={() => setActiveTab('url')}
            style={{
              padding: '8px 18px',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              background: activeTab === 'url' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              color: activeTab === 'url' ? '#818CF8' : '#94A3B8',
              outline: activeTab === 'url' ? '1px solid rgba(99, 102, 241, 0.4)' : 'none',
            }}
          >
            🔗 Tempel URL Gambar
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1 }}>
          {/* TAB 1: GALLERY & PRESETS */}
          {activeTab === 'gallery' && (
            <div>
              {/* Filter Chips */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedFilter(cat)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '999px',
                      border: '1px solid',
                      borderColor: selectedFilter === cat ? '#6366F1' : 'rgba(255,255,255,0.08)',
                      background: selectedFilter === cat ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.02)',
                      color: selectedFilter === cat ? '#A5B4FC' : '#94A3B8',
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#94A3B8' }}>
                  Memuat aset galeri...
                </div>
              ) : filteredList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#94A3B8' }}>
                  Tidak ada aset di kategori ini.
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                    gap: '16px',
                  }}
                >
                  {filteredList.map((item) => {
                    const isCurrent = currentUrl === item.url;
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelectImage(item.url)}
                        style={{
                          position: 'relative',
                          borderRadius: '14px',
                          overflow: 'hidden',
                          border: isCurrent ? '2px solid #10B981' : '1px solid rgba(255, 255, 255, 0.1)',
                          background: 'rgba(255, 255, 255, 0.03)',
                          cursor: 'pointer',
                          transition: 'transform 0.2s ease, border-color 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          if (!isCurrent) e.currentTarget.style.borderColor = '#818CF8';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          if (!isCurrent) e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        }}
                      >
                        {/* 16:9 Image Preview */}
                        <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9' }}>
                          <Image
                            src={item.url}
                            alt={item.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 300px"
                            style={{ objectFit: 'cover' }}
                            loading="lazy"
                          />
                          <span
                            style={{
                              position: 'absolute',
                              top: '8px',
                              right: '8px',
                              background: 'rgba(0, 0, 0, 0.75)',
                              color: '#A5B4FC',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontSize: '10.5px',
                              fontWeight: 700,
                            }}
                          >
                            16:9
                          </span>
                          {isCurrent && (
                            <span
                              style={{
                                position: 'absolute',
                                top: '8px',
                                left: '8px',
                                background: '#10B981',
                                color: '#fff',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                fontSize: '10px',
                                fontWeight: 700,
                              }}
                            >
                              ✓ Sedang Dipakai
                            </span>
                          )}
                        </div>

                        {/* Title & Category Info */}
                        <div style={{ padding: '10px 12px' }}>
                          <p
                            style={{
                              margin: 0,
                              fontSize: '12px',
                              fontWeight: 600,
                              color: '#F8FAFC',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {item.name}
                          </p>
                          <span style={{ fontSize: '11px', color: '#64748B' }}>{item.category}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DRAG & DROP UPLOAD */}
          {activeTab === 'upload' && (
            <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
                }}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed rgba(99, 102, 241, 0.4)',
                  borderRadius: '1.5rem',
                  padding: '48px 24px',
                  background: 'rgba(99, 102, 241, 0.04)',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/mp4"
                  style={{ display: 'none' }}
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                />
                <span style={{ fontSize: '42px', display: 'block', marginBottom: '12px' }}>☁️</span>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 6px', color: '#F8FAFC' }}>
                  {uploading ? 'Mengunggah ke Supabase Storage...' : 'Klik atau Drag & Drop Gambar ke Sini'}
                </h3>
                <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0 }}>
                  Mendukung format JPG, PNG, WebP (Rasio disarankan 16:9 untuk hasil maksimal)
                </p>
                <span
                  style={{
                    display: 'inline-block',
                    marginTop: '18px',
                    padding: '8px 18px',
                    borderRadius: '8px',
                    background: '#6366F1',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                >
                  Pilih File dari Komputer
                </span>
              </div>
              {uploadError && <p style={{ color: '#EF4444', fontSize: '13px', marginTop: '12px' }}>{uploadError}</p>}
            </div>
          )}

          {/* TAB 3: DIRECT URL INPUT */}
          {activeTab === 'url' && (
            <div style={{ maxWidth: '640px', margin: '0 auto' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: '#94A3B8',
                  marginBottom: '8px',
                }}
              >
                Paste Direct Image Link (Unsplash / CDN / Storage URL)
              </label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <input
                  type="text"
                  value={customUrl}
                  onChange={(e) => {
                    setCustomUrl(e.target.value);
                    setUrlPreviewValid(true);
                  }}
                  placeholder="https://images.unsplash.com/..."
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: '#fff',
                    fontSize: '13.5px',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => customUrl && handleSelectImage(customUrl)}
                  disabled={!customUrl}
                  style={{
                    padding: '0 20px',
                    borderRadius: '10px',
                    background: '#6366F1',
                    border: 'none',
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: customUrl ? 'pointer' : 'not-allowed',
                    opacity: customUrl ? 1 : 0.5,
                  }}
                >
                  Terapkan Gambar
                </button>
              </div>

              {/* Preview */}
              {customUrl && urlPreviewValid && (
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '16 / 9',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: '#000',
                  }}
                >
                  <img
                    src={customUrl}
                    alt="Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={() => setUrlPreviewValid(false)}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '8px',
                      left: '8px',
                      background: 'rgba(0,0,0,0.7)',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      color: '#10B981',
                      fontWeight: 600,
                    }}
                  >
                    ✓ Preview Valid (16:9 Fit)
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
