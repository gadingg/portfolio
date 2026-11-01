const test = require('node:test'), assert = require('node:assert/strict');
const { runtime } = require('./cms-script-runtime.cjs');
const { publishOneWork } = runtime()('lib/work-publication.ts');
const { readDraftBackup, sameDraftContent, draftSaveMessage } = runtime()('lib/draft-backup.ts');
const item = (id, extra = {}) => ({ id, title: id, kind: 'webapp', description: '', image: '', imageAlt: '', url: 'https://example.com/', published: true, demo: false, artwork: 'sample', ...extra });

test('publishing a selected work preserves public order and other unpublished drafts', () => {
  const published = [item('one'), item('two')];
  const draft = [item('two', { title: 'Unpublished edit' }), item('one', { title: 'Selected edit' }), item('new')];
  const result = publishOneWork(draft, published, 'one').items;
  assert.deepEqual(result.map(value => value.id), ['one', 'two']);
  assert.equal(result[0].title, 'Selected edit');
  assert.deepEqual(result[1], published[1]);
  assert.deepEqual(published.map(value => value.title), ['one', 'two']);
  assert.deepEqual(publishOneWork(draft, published, 'new').items.map(value => value.id), ['one', 'two', 'new']);
});

test('selected publication validates only that work and rejects missing targets and public slug collisions', () => {
  const video = item('video', { kind: 'video', videoSource: 'file', videoFile: '/api/media/video.mp4', image: '' });
  assert.throws(() => publishOneWork([video], [], 'video'), /thumbnail/);
  assert.throws(() => publishOneWork([], [], 'missing'), /tidak ditemukan/);
  assert.equal(publishOneWork([item('one'), video], [item('one')], 'one').items.length, 1);
  const study = { slug: 'same', problem: 'Problem', solution: 'Solution', impact: 'Result', appUrl: '', blocks: [] };
  assert.throws(() => publishOneWork([item('two', { caseStudy: study })], [item('one', { caseStudy: study })], 'two'), /Slug/);
});

test('one request saves and publishes the chosen work, retains other drafts, checks revision, and leaves ordering unpublished', async () => {
  const original = [item('one'), item('two')];
  let doc = { revision: 7, draft: { items: [item('two', { title: 'Other draft' }), item('one')] }, published: { items: original } };
  let writes = 0;
  class Conflict extends Error {}
  const db = runtime({ './cms': { readCMS: async () => structuredClone(doc), CMSConflict: Conflict, writeCMS: async (_id, current, draft, published) => { writes++; doc = { revision: current.revision + 1, draft, published }; return doc; } }, './public-projects': {}, './gallery': {}, '@/lib/supabase/public': {}, '@/lib/supabase/admin': {}, '@/lib/project-presentation': {} })('lib/db/works.ts');
  await db.changeWorks({ revision: 7, action: 'publish', workId: 'one', items: [item('one', { title: 'Direct publish' })] });
  assert.equal(writes, 1);
  assert.equal(doc.draft.items[1].title, 'Direct publish');
  assert.equal(doc.draft.items[0].title, 'Other draft');
  assert.deepEqual(doc.published.items.map(value => value.id), ['one', 'two']);
  assert.equal(doc.published.items[0].title, 'Direct publish');
  assert.equal(doc.published.items[1].title, 'two');
  await assert.rejects(db.changeWorks({ revision: 7, action: 'publish', workId: 'one', items: [item('one')] }), Conflict);
  assert.equal(writes, 1);
  await db.changeWorks({ revision: 8, action: 'save', items: doc.draft.items });
  assert.equal(doc.published.items[1].title, 'two');
});

test('malformed backups fail closed, while valid offline edits retain revision and content', () => {
  for (const value of [null, '{', '{}', JSON.stringify({ version: 2, revision: 1, value: '[]', savedAt: 'now' }), JSON.stringify({ version: 1, revision: 1, value: 'broken', savedAt: 'now' })]) assert.equal(readDraftBackup(value), null);
  const backup = { version: 1, revision: 9, value: JSON.stringify([item('one', { title: 'Offline edit' })]), savedAt: '2026-11-01T00:00:00Z' };
  assert.deepEqual(readDraftBackup(JSON.stringify(backup)), backup);
});


test('recovery recognizes an acknowledged draft despite server timestamps and keeps real content changes distinct', () => {
  assert.equal(sameDraftContent(JSON.stringify([item('one')]), JSON.stringify([item('one', { updatedAt: '2026-11-01T00:00:00Z' })])), true);
  assert.equal(sameDraftContent(JSON.stringify([item('one')]), JSON.stringify([item('one', { title: 'New server content' })])), false);
  assert.equal(sameDraftContent('{', '{}'), false);
  assert.equal(draftSaveMessage(new TypeError('Failed to fetch')), 'Koneksi ke server terputus. Periksa koneksi lalu coba lagi.');
  assert.equal(draftSaveMessage(new Error('Data berubah di sesi lain.')), 'Data berubah di sesi lain.');
});
