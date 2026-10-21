export function publicationState(dirty: boolean, unpublished: boolean, busy = false) {
  return {
    visible: dirty || unpublished || busy,
    canSave: dirty && !busy,
    canPublish: !dirty && unpublished && !busy,
    label: busy ? 'Memproses…' : dirty ? 'Ada perubahan belum disimpan' : unpublished ? 'Draft tersimpan, belum tayang' : 'Semua perubahan tersimpan',
  };
}
