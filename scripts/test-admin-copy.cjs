const test = require('node:test'), assert = require('node:assert/strict');
const { runtime } = require('./cms-script-runtime.cjs');
const { workPublicationCopy } = runtime()('lib/admin-copy.ts');
const { draftStatusCopy } = runtime()('lib/draft-backup.ts');
const item = (patch = {}) => ({ id: 'one', title: 'Portofolio', kind: 'webapp', url: 'https://example.com/', description: '', image: '', imageAlt: '', published: true, demo: false, artwork: 'sample', ...patch });

test('publication copy only claims a portfolio is live when the published record is visible and ready', () => {
  assert.equal(workPublicationCopy(item(), item()).cleanLabel, 'Sudah tayang');
  assert.notEqual(workPublicationCopy(item(), undefined).cleanLabel, 'Sudah tayang');
  assert.notEqual(workPublicationCopy(item({ url: '' }), item({ url: '' })).cleanLabel, 'Sudah tayang');
  assert.notEqual(workPublicationCopy(item({ published: false }), item({ published: false })).cleanLabel, 'Sudah tayang');
  assert.equal(workPublicationCopy().cleanLabel, 'Semua perubahan tersimpan');
});

test('hiding a live portfolio exposes the hide action; an already private portfolio needs no publication action', () => {
  const hiding = workPublicationCopy(item({ published: false }), item());
  assert.equal(hiding.publishLabel, 'Sembunyikan dari website');
  assert.equal(hiding.showPublish, true);
  assert.equal(hiding.busyLabel, 'Menyembunyikan…');
  for (const published of [undefined, item({ published: false })]) {
    const hidden = workPublicationCopy(item({ published: false }), published);
    assert.equal(hidden.showPublish, false);
    assert.match(hidden.cleanLabel, /tersembunyi/);
    assert.match(hidden.pendingSuffix, /tersembunyi/);
  }
  assert.equal(workPublicationCopy(item(), item({ published: false })).showPublish, true);
});

test('draft status never claims a local copy exists when persistence failed', () => {
  const state = { online: true, dirty: true, localCopy: false, saving: false, failed: false, storageFailed: false };
  assert.equal(draftStatusCopy(state), 'Menunggu disimpan…');
  assert.equal(draftStatusCopy({ ...state, saving: true }), 'Menyimpan…');
  assert.equal(draftStatusCopy({ ...state, dirty: false }), 'Draft tersimpan');
  assert.equal(draftStatusCopy({ ...state, online: false, localCopy: true }), 'Offline · tersimpan di perangkat');
  assert.equal(draftStatusCopy({ ...state, online: false }), 'Belum tersimpan. Jangan tutup halaman ini.');
  assert.match(draftStatusCopy({ ...state, failed: true, localCopy: true }), /Edit masih ada di perangkat/);
  assert.doesNotMatch(draftStatusCopy({ ...state, failed: true }), /ada di perangkat/);
  assert.match(draftStatusCopy({ ...state, storageFailed: true }), /Jangan tutup/);
});
