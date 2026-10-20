const fs = require('node:fs');
const path = require('node:path');
const { isDeepStrictEqual } = require('node:util');
const { env, runtime, root } = require('./cms-script-runtime.cjs');
env();

(async () => {
  const load = runtime();
  const { getWorksDocument } = load('lib/db/works.ts');
  const { writeCMS } = load('lib/db/cms.ts');
  const { updateReqVideo } = load('lib/req-video-content.ts');
  const { WorksDraftSchema, WorksSchema } = load('lib/works.ts');
  const client = load('lib/supabase/admin.ts').createAdminClient();
  const current = await getWorksDocument();
  for (const state of ['draft', 'published']) {
    if (current[state].items.filter(x => x.caseStudy?.slug === 'req-video-bareng-patosser').length !== 1)
      throw new Error(`Expected exactly one Req Video in ${state}.`);
  }
  const files = {
    cover: 'public/assets/work/req-take-video.webp',
  };
  const media = {};
  for (const [key, file] of Object.entries(files)) {
    const name = `works/req-video-20261019/${path.basename(file)}`;
    media[key] = client.storage.from('portfolio-public').getPublicUrl(name).data.publicUrl;
  }
  const draft = WorksDraftSchema.parse({ ...current.draft, items: updateReqVideo(current.draft.items, media.cover) });
  const published = WorksSchema.parse({ ...current.published, items: updateReqVideo(current.published.items, media.cover) });
  for (const state of ['draft', 'published']) {
    const next = state === 'draft' ? draft : published;
    const unrelated = x => x.caseStudy?.slug !== 'req-video-bareng-patosser';
    if (!isDeepStrictEqual(current[state].items.filter(unrelated), next.items.filter(unrelated)))
      throw new Error('Unrelated content changed.');
  }
  if (!process.argv.includes('--apply')) {
    console.log(JSON.stringify({ mode: 'preview', revision: current.revision, target: 'req-video-bareng-patosser', blocks: published.items.find(x=>x.caseStudy?.slug==='req-video-bareng-patosser').caseStudy.blocks.length, media }));
    return;
  }
  if (isDeepStrictEqual(draft, current.draft) && isDeepStrictEqual(published, current.published)) {
    console.log('Already current; no write needed.'); return;
  }
  const backup = path.join(root, '.cms-backups', `before-req-video-${Date.now()}.json`);
  fs.mkdirSync(path.dirname(backup), { recursive: true });
  fs.writeFileSync(backup, JSON.stringify(current, null, 2));
  for (const [key, file] of Object.entries(files)) {
    const name = `works/req-video-20261019/${path.basename(file)}`;
    const { error } = await client.storage.from('portfolio-public').upload(name, fs.readFileSync(path.join(root, file)), { contentType: key === 'cover' ? 'image/webp' : 'image/png', upsert: false });
    if (error && !/already exists|duplicate/i.test(error.message)) throw error;
  }
  const saved = await writeCMS('works', current, draft, published);
  const reread = await getWorksDocument();
  if (!isDeepStrictEqual(reread.draft, draft) || !isDeepStrictEqual(reread.published, published))
    throw new Error('CMS readback mismatch.');
  console.log(JSON.stringify({ savedRevision: saved.revision, verified: true, unrelatedPreserved: true }));
})().catch(error => { console.error(error.message); process.exitCode = 1; });



