import type { WorkItem } from './works';
import { isReadyWork } from './work-readiness';

export function workPublicationCopy(item?: WorkItem, published?: WorkItem) {
  const hiding = !!item && !item.published && !!published?.published;
  const hidden = !!item && !item.published && !hiding;
  return {
    publishLabel: hiding ? 'Sembunyikan dari website' : 'Terbitkan',
    busyLabel: hiding ? 'Menyembunyikan…' : 'Menerbitkan…',
    showPublish: !hidden,
    cleanLabel: !item ? 'Semua perubahan tersimpan' : !item.published ? 'Perubahan tersimpan · tersembunyi'
      : published?.published && isReadyWork(published) ? 'Sudah tayang' : 'Perubahan tersimpan',
    pendingSuffix: hidden ? ' · tersembunyi' : ' · belum tayang',
    scope: !item ? 'Semua perubahan portofolio dan urutannya ikut diterbitkan.' : hidden ? 'Portofolio ini tidak tampil di website.' : hiding ? '' : 'Hanya portofolio ini yang diterbitkan.',
  };
}
