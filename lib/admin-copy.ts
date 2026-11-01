import type { WorkItem } from './works';
import { isReadyWork } from './work-readiness';

export function workPublicationCopy(item?: WorkItem, published?: WorkItem) {
  const hiding = !!item && !item.published && !!published?.published;
  const hidden = !!item && !item.published && !hiding;
  return {
    publishLabel: hiding ? 'Sembunyikan dari website' : 'Publish',
    busyLabel: hiding ? 'Menyembunyikan…' : 'Publishing…',
    showPublish: !hidden,
    cleanLabel: !item ? 'Semua perubahan tersimpan' : !item.published ? 'Perubahan tersimpan · tersembunyi'
      : published?.published && isReadyWork(published) ? 'Sudah tayang' : 'Perubahan tersimpan',
    pendingSuffix: hidden ? ' · tersembunyi' : ' · belum di-publish',
    scope: !item ? 'Semua perubahan portofolio dan urutannya ikut di-publish.' : hidden ? 'Portofolio ini tidak tampil di website.' : hiding ? '' : 'Hanya portofolio ini yang di-publish.',
  };
}
