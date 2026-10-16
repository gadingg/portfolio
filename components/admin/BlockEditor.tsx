'use client';
import { Plus, Trash2 } from 'lucide-react';
import { SortableList } from './SortableList';
import { FileDrop } from './FileDrop';
import type { CMSBlock } from '@/lib/content-blocks';
const labels: Record<CMSBlock['block_type'], string> = {
  heading: 'Judul',
  paragraph: 'Teks',
  image: 'Gambar',
  gallery: 'Galeri',
  video: 'Video',
  quote: 'Kutipan',
  metrics: 'Hasil',
  list: 'Daftar',
  divider: 'Pemisah',
  link: 'Tautan',
};
const defaults: Record<CMSBlock['block_type'], Record<string, unknown>> = {
  heading: { text: '', level: 2 },
  paragraph: { text: '' },
  image: { url: '', alt: '', caption: '' },
  gallery: { images: [], layout: 'grid' },
  video: { url: '', poster: '', caption: '' },
  quote: { quote: '', attribution: '' },
  metrics: { items: [] },
  list: { items: [], ordered: false },
  divider: { style: 'line' },
  link: { url: '', label: '' },
};
export function BlockEditor({
  blocks,
  onChange,
  disabled,
  onBusyChange,
}: {
  blocks: CMSBlock[];
  onChange: (blocks: CMSBlock[]) => void;
  disabled: boolean;
  onBusyChange?: (busy: boolean) => void;
}) {
  const patch = (id: string, content: Record<string, unknown>) =>
    onChange(
      blocks.map((block) =>
        block.id === id
          ? { ...block, content_json: { ...block.content_json, ...content } }
          : block,
      ),
    );
  const field = (
    block: CMSBlock,
    key: string,
    label: string,
    multiline = false,
  ) => (
    <label>
      {label}
      {multiline ? (
        <textarea
          rows={3}
          value={String(block.content_json[key] || '')}
          onChange={(e) => patch(block.id, { [key]: e.target.value })}
        />
      ) : (
        <input
          value={String(block.content_json[key] || '')}
          onChange={(e) => patch(block.id, { [key]: e.target.value })}
        />
      )}
    </label>
  );
  return (
    <section className="cms-blocks">
      <div className="cms-panel-heading">
        <h2>Isi studi kasus</h2>
        <select
          aria-label="Tambah blok"
          value=""
          disabled={disabled}
          onChange={(e) => {
            const type = e.target.value as CMSBlock['block_type'];
            onChange([
              ...blocks,
              {
                id: crypto.randomUUID(),
                block_type: type,
                block_order: blocks.length,
                content_json: structuredClone(defaults[type]),
              },
            ]);
          }}
        >
          <option value="">Tambah blok</option>
          {Object.entries(labels).map(([type, label]) => (
            <option key={type} value={type}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <SortableList
        items={blocks}
        disabled={disabled}
        onChange={(next) =>
          onChange(next.map((block, i) => ({ ...block, block_order: i })))
        }
      >
        {(block, index, handle) => {
          const content = block.content_json as any;
          return (
            <div className="cms-block">
              <div className="cms-block-row">
                {handle}
                <details>
                  <summary>
                    {labels[block.block_type]}
                    <span>
                      {String(
                        content.text ||
                          content.caption ||
                          content.quote ||
                          content.label ||
                          '',
                      ).slice(0, 70)}
                    </span>
                  </summary>
                  <fieldset disabled={disabled} className="cms-block-fields">
                    {['heading', 'paragraph'].includes(block.block_type) &&
                      field(block, 'text', 'Teks', true)}
                    {block.block_type === 'heading' && (
                      <label>
                        Ukuran
                        <select
                          value={content.level || 2}
                          onChange={(e) =>
                            patch(block.id, { level: Number(e.target.value) })
                          }
                        >
                          <option value={2}>Judul bagian</option>
                          <option value={3}>Subjudul</option>
                        </select>
                      </label>
                    )}
                    {['image', 'video'].includes(block.block_type) && (
                      <>
                        {content.url &&
                          (block.block_type === 'image' ? (
                            <img
                              className="cms-image-preview"
                              src={content.url}
                              alt={content.alt || ''}
                            />
                          ) : (
                            <video
                              className="cms-image-preview"
                              src={content.url}
                              controls
                              preload="metadata"
                            />
                          ))}
                        <FileDrop
                          folder="content"
                          disabled={disabled}
                          onBusyChange={onBusyChange}
                          accept={
                            block.block_type === 'video'
                              ? 'video/mp4,video/webm'
                              : 'image/jpeg,image/png,image/webp,image/gif'
                          }
                          onUploaded={(files) =>
                            patch(block.id, { url: files[0].url })
                          }
                        />
                        {field(block, 'url', 'URL media')}
                        {block.block_type === 'image' &&
                          field(block, 'alt', 'Deskripsi gambar')}
                        {field(block, 'caption', 'Caption')}
                      </>
                    )}
                    {block.block_type === 'gallery' && (
                      <>
                        <FileDrop
                          multiple
                          folder="content"
                          disabled={disabled}
                          onBusyChange={onBusyChange}
                          onUploaded={(files) =>
                            patch(block.id, {
                              images: [
                                ...(content.images || []),
                                ...files.map((file) => ({
                                  url: file.url,
                                  alt: file.filename.replace(/\.[^.]+$/, ''),
                                  caption: '',
                                })),
                              ],
                            })
                          }
                        />
                        {(content.images || []).map((image: any, i: number) => (
                          <div
                            className="cms-gallery-edit"
                            key={`${image.url}-${i}`}
                          >
                            <img src={image.url} alt="" />
                            <label>
                              Deskripsi gambar
                              <input
                                value={image.alt || ''}
                                onChange={(e) =>
                                  patch(block.id, {
                                    images: content.images.map(
                                      (img: any, j: number) =>
                                        j === i
                                          ? { ...img, alt: e.target.value }
                                          : img,
                                    ),
                                  })
                                }
                              />
                            </label>
                            <label>
                              Caption
                              <input
                                value={image.caption || ''}
                                onChange={(e) =>
                                  patch(block.id, {
                                    images: content.images.map(
                                      (img: any, j: number) =>
                                        j === i
                                          ? { ...img, caption: e.target.value }
                                          : img,
                                    ),
                                  })
                                }
                              />
                            </label>
                            <button
                              type="button"
                              className="wm-button"
                              aria-label={`Hapus gambar ${i + 1}`}
                              onClick={() =>
                                patch(block.id, {
                                  images: content.images.filter(
                                    (_img: any, j: number) => j !== i,
                                  ),
                                })
                              }
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        ))}
                      </>
                    )}
                    {block.block_type === 'quote' && (
                      <>
                        {field(block, 'quote', 'Kutipan', true)}
                        {field(block, 'attribution', 'Sumber')}
                        {field(block, 'role', 'Keterangan sumber')}
                      </>
                    )}
                    {block.block_type === 'link' && (
                      <>
                        {field(block, 'label', 'Label')}
                        {field(block, 'url', 'Tautan')}
                      </>
                    )}
                    {block.block_type === 'list' && (
                      <>
                        <label>
                          Daftar
                          <textarea
                            rows={5}
                            value={(content.items || []).join('\n')}
                            onChange={(e) =>
                              patch(block.id, {
                                items: e.target.value.split('\n'),
                              })
                            }
                          />
                        </label>
                        <label className="wm-check">
                          <input
                            type="checkbox"
                            checked={!!content.ordered}
                            onChange={(e) =>
                              patch(block.id, { ordered: e.target.checked })
                            }
                          />
                          Gunakan nomor
                        </label>
                      </>
                    )}
                    {block.block_type === 'metrics' && (
                      <>
                        {(content.items || []).map((item: any, i: number) => (
                          <div className="cms-inline-fields" key={i}>
                            {['value', 'label', 'description'].map((key, j) => (
                              <label key={key}>
                                {['Nilai', 'Label', 'Keterangan'][j]}
                                <input
                                  value={item[key] || ''}
                                  onChange={(e) =>
                                    patch(block.id, {
                                      items: content.items.map(
                                        (value: any, n: number) =>
                                          n === i
                                            ? {
                                                ...value,
                                                [key]: e.target.value,
                                              }
                                            : value,
                                      ),
                                    })
                                  }
                                />
                              </label>
                            ))}
                            <button
                              type="button"
                              className="wm-button"
                              aria-label={`Hapus hasil ${i + 1}`}
                              onClick={() =>
                                patch(block.id, {
                                  items: content.items.filter(
                                    (_v: any, n: number) => n !== i,
                                  ),
                                })
                              }
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="wm-button"
                          onClick={() =>
                            patch(block.id, {
                              items: [
                                ...(content.items || []),
                                { value: '', label: '', description: '' },
                              ],
                            })
                          }
                        >
                          <Plus size={18} />
                          Tambah hasil
                        </button>
                      </>
                    )}
                    {block.block_type === 'divider' && <p>Pemisah bagian.</p>}
                    <button
                      type="button"
                      className="wm-button cms-delete"
                      onClick={() =>
                        onChange(
                          blocks.filter((value) => value.id !== block.id),
                        )
                      }
                    >
                      <Trash2 size={18} />
                      Hapus blok
                    </button>
                  </fieldset>
                </details>
              </div>
            </div>
          );
        }}
      </SortableList>
      {!blocks.length && <p>Belum ada isi studi kasus.</p>}
    </section>
  );
}
