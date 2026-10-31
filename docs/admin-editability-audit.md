# Admin content editing audit

Scope: all admin routes, with content edits kept in drafts. System navigation labels, analytics and decorative code-based icons are not CMS content.

| Screen | Text | Media | Ordering |
| --- | --- | --- | --- |
| Portfolio, all three categories | Title, description, labels and settings in the form | Drop onto the preview, upload replacement or choose existing media | Drag handle, keyboard Space/arrows, or explicit up/down buttons |
| Case study with blocks | Heading, paragraph, quote, list, metrics and link fields | Replace/add images, gallery items and video posters | Blocks and individual gallery images can be dragged or moved with buttons |
| Case study with custom layout | Searchable **Teks cerita** form preserves inline formatting; overview fields remain above it | **Gambar isi studi kasus** replaces/adds screenshots with alt text and captions | Whole sections in the visual editor; individual mockup layers are kept in their responsive containers |
| Visual editor, homepage and cases | Select text/link in the canvas, edit in sidebar | Selected image has a visible replacement/drop zone; stale responsive image sources are cleared | Section sidebar supports drag, keyboard and up/down; moves across different parents are blocked |
| Website & CV | Fields grouped by website section; CV text remains separate from the original PDF | Image preview/drop zones and an explicit **Ganti PDF CV** action | Experience and education support drag, keyboard and up/down |
| AI Study Case | Brief and generated review fields are editable before applying | Thumbnail uses the same replacement/drop zone | Apply to draft, then arrange narrative blocks or sections in the regular editor |
| Overview | Read-only analytics | No authored media | Not applicable |
| AI Settings | Editable key/model controls | No authored media | Not applicable |
| Gallery and legacy portfolio routes | Redirect to the shared Portfolio editor | Shared controls | Shared controls |

Replacing title, description, cover, cover alt or application link in the form also updates the corresponding standard intro/cover in a saved custom case layout. Unchanged metadata does not rewrite manually edited layout media. Narrative screenshots, inline markup and CSS are preserved.

Video remains upload-only MP4 with static homepage thumbnails. Playback starts after opening the public popup. No automatic compression was added.

Validation: production build and 102 regression tests passed. Browser checks covered desktop/mobile page widths, drag and keyboard section reordering, CV ordering, text replacement/cancellation, image selection from the existing media library, and gallery ordering with captions retained. One temporary hidden test portfolio was accidentally saved during QA, then removed and the restored draft saved. The collection returned to 7 apps, 4 designs and 7 videos with no pending changes. No test content was published and no new media was uploaded.
