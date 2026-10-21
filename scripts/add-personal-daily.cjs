const fs = require('node:fs');
const path = require('node:path');
const { isDeepStrictEqual } = require('node:util');
const { env, runtime, root } = require('./cms-script-runtime.cjs');
env();

(async () => {
  const load = runtime();
  const { getWorksDocument } = load('lib/db/works.ts');
  const { writeCMS } = load('lib/db/cms.ts');
  const { addPersonalDaily, personalDailyId } = load('lib/personal-daily-content.ts');
  const { WorksDraftSchema, WorksSchema } = load('lib/works.ts');
  const client = load('lib/supabase/admin.ts').createAdminClient();
  const current = await getWorksDocument();
  const file = path.join(root, 'public/assets/work/personal-daily.webp');
  const name = 'works/personal-daily-20261021/personal-daily.webp';
  const cover = client.storage.from('portfolio-public').getPublicUrl(name).data.publicUrl;
  const draft = WorksDraftSchema.parse({ ...current.draft, items: addPersonalDaily(current.draft.items, cover) });
  const published = WorksSchema.parse({ ...current.published, items: addPersonalDaily(current.published.items, cover) });
  for (const [state, next] of [['draft', draft], ['published', published]]) {
    if (!isDeepStrictEqual(current[state].items, next.items.filter(item => item.id !== personalDailyId)))
      throw new Error('Unrelated content or order changed.');
  }
  if (!process.argv.includes('--apply')) {
    console.log(JSON.stringify({ mode: 'preview', revision: current.revision, target: '/work/mydaily', title: published.items.find(item => item.id === personalDailyId).title, unrelatedPreserved: true }));
    return;
  }
  const backup = path.join(root, '.cms-backups', `before-personal-daily-${Date.now()}.json`);
  fs.mkdirSync(path.dirname(backup), { recursive: true });
  fs.writeFileSync(backup, JSON.stringify(current, null, 2));
  const { error } = await client.storage.from('portfolio-public').upload(name, fs.readFileSync(file), { contentType: 'image/webp', upsert: false });
  if (error && !/already exists|duplicate/i.test(error.message)) throw error;
  const saved = await writeCMS('works', current, draft, published);
  const reread = await getWorksDocument();
  if (!isDeepStrictEqual(reread.draft, draft) || !isDeepStrictEqual(reread.published, published)) throw new Error('CMS readback mismatch.');
  console.log(JSON.stringify({ savedRevision: saved.revision, verified: true, unrelatedPreserved: true, route: '/work/mydaily' }));
})().catch(error => { console.error(error.message); process.exitCode = 1; });
