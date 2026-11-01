export function publicationState(dirty: boolean, unpublished: boolean, busy = false) {
  return {
    visible: dirty || unpublished || busy,
    canSave: dirty && !busy,
    canPublish: (dirty || unpublished) && !busy,
    label: busy ? 'Memproses…' : dirty ? 'Menunggu simpan otomatis…' : unpublished ? 'Draft tersimpan · belum di-publish' : 'Semua perubahan tersimpan',
  };
}
